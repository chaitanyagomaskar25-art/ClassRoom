import express from 'express';
import { z } from 'zod';
import StudyPlan from '../models/StudyPlan.js';
import LessonProgress from '../models/LessonProgress.js';
import { authenticate, allowRoles } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import validate from '../utils/validation.js';
import HttpError from '../utils/httpError.js';
import {
  officialSemesters,
  allCurriculumSubjects,
  findSubjectByCodeOrId,
  LESSONS_PER_UNIT,
  UNITS_PER_SUBJECT
} from '../config/curriculumMap.js';

const router = express.Router();

function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(dateStr, numDays) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + numDays);
  return formatDate(d);
}

function getTodayStr() {
  return formatDate(new Date());
}

/**
 * Build dynamic schedule based on student's actual lesson progress
 */
async function generateDynamicSchedule(studentId, subjectCode, targetDate, dailyMinutes = 60, semesterNum = 1) {
  // 1. Fetch student's real completed lessons
  const completedDocs = await LessonProgress.find({ studentId, status: 'completed' }).lean();
  const completedSet = new Set(completedDocs.map((d) => String(d.lessonId)));

  // 2. Determine subjects to plan
  let subjectsToPlan = [];
  if (subjectCode === 'all') {
    const semPlan = officialSemesters.find((s) => s.semester === semesterNum) || officialSemesters[0];
    subjectsToPlan = semPlan.subjects;
  } else {
    const found = findSubjectByCodeOrId(subjectCode);
    if (!found) throw new HttpError(404, 'Subject not found in official curriculum');
    subjectsToPlan = [found];
  }

  // 3. Assemble all sequential tasks (pending lessons + unit revisions)
  const pendingTasks = [];
  for (const sub of subjectsToPlan) {
    for (let u = 1; u <= UNITS_PER_SUBJECT; u++) {
      let unitHasPending = false;
      for (let l = 1; l <= LESSONS_PER_UNIT; l++) {
        const lessonId = `${sub.code}-u${u}-l${l}`;
        const isDone = completedSet.has(lessonId);
        if (!isDone) {
          unitHasPending = true;
          pendingTasks.push({
            id: `task-${lessonId}`,
            taskType: 'lesson',
            lessonId,
            title: `${sub.name}: Unit ${u} Lesson ${l}`,
            estimatedMinutes: 30,
            unitNumber: `Unit ${u}`,
            unitIndex: u - 1,
            subjectCode: sub.code,
            subjectName: sub.name,
            completed: false
          });
        }
      }

      // Schedule a dedicated unit revision session
      const revisionId = `${sub.code}-u${u}-rev`;
      const isRevDone = completedSet.has(revisionId);
      if (!isRevDone) {
        pendingTasks.push({
          id: `task-${revisionId}`,
          taskType: 'revision',
          lessonId: revisionId,
          title: `Unit ${u} Revision Session & Practice Milestone (${sub.name})`,
          estimatedMinutes: 45,
          unitNumber: `Unit ${u}`,
          unitIndex: u - 1,
          subjectCode: sub.code,
          subjectName: sub.name,
          completed: false
        });
      }
    }

    // Schedule a final course milestone review
    const courseRevId = `${sub.code}-course-rev`;
    if (!completedSet.has(courseRevId)) {
      pendingTasks.push({
        id: `task-${courseRevId}`,
        taskType: 'milestone',
        lessonId: courseRevId,
        title: `${sub.name} Comprehensive Course Exam Review & Self-Assessment`,
        estimatedMinutes: 60,
        unitNumber: 'Course Review',
        unitIndex: 4,
        subjectCode: sub.code,
        subjectName: sub.name,
        completed: false
      });
    }
  }

  // 4. Distribute into daily schedule based on dailyAvailableMinutes
  const todayStr = getTodayStr();
  let currDateStr = todayStr;
  let currDayMinutes = 0;
  const schedule = [];

  for (const task of pendingTasks) {
    // If adding task exceeds dailyMinutes and today already has tasks, advance to next day
    if (currDayMinutes + task.estimatedMinutes > dailyMinutes && currDayMinutes > 0) {
      currDateStr = addDays(currDateStr, 1);
      currDayMinutes = 0;
    }

    schedule.push({
      ...task,
      date: currDateStr,
      completed: false
    });

    currDayMinutes += task.estimatedMinutes;
  }

  // 5. Generate Weekly Goals
  const weeklyGoalsMap = {};
  for (const item of schedule) {
    const itemDate = new Date(item.date);
    const dayOfWeek = itemDate.getDay(); // 0 is Sun, 1 is Mon
    const diffToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(itemDate);
    monday.setDate(itemDate.getDate() - diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const weekKey = formatDate(monday);
    if (!weeklyGoalsMap[weekKey]) {
      weeklyGoalsMap[weekKey] = {
        weekNumber: Object.keys(weeklyGoalsMap).length + 1,
        startDate: formatDate(monday),
        endDate: formatDate(sunday),
        targetLessons: 0,
        completedLessons: 0,
        targetMinutes: 0,
        completedMinutes: 0,
        revisionSessions: 0,
        status: 'on_track'
      };
    }

    if (item.taskType === 'lesson') weeklyGoalsMap[weekKey].targetLessons++;
    if (item.taskType === 'revision') weeklyGoalsMap[weekKey].revisionSessions++;
    weeklyGoalsMap[weekKey].targetMinutes += item.estimatedMinutes;
  }

  const weeklyGoals = Object.values(weeklyGoalsMap);

  // 6. Generate Reminders
  const reminders = [];
  const todayTasks = schedule.filter((t) => t.date === todayStr);
  if (todayTasks.length > 0) {
    reminders.push({
      id: `rem-today-${Date.now()}`,
      type: 'pending_lesson',
      message: `You have ${todayTasks.length} study tasks scheduled for today (~${todayTasks.reduce(
        (acc, t) => acc + t.estimatedMinutes,
        0
      )} mins).`,
      date: todayStr,
      priority: 'high',
      read: false
    });
  }

  const upcomingRevisions = schedule.filter(
    (t) => t.taskType === 'revision' && t.date >= todayStr && t.date <= addDays(todayStr, 2)
  );
  for (const rev of upcomingRevisions) {
    reminders.push({
      id: `rem-rev-${rev.id}`,
      type: 'upcoming_revision',
      message: `Upcoming: ${rev.title} scheduled on ${rev.date}.`,
      date: rev.date,
      priority: 'medium',
      read: false
    });
  }

  return {
    schedule,
    weeklyGoals,
    reminders
  };
}

/**
 * GET /study-plan
 * Get active study plan(s) for the authenticated student
 */
router.get(
  '/',
  authenticate,
  allowRoles('student'),
  asyncHandler(async (req, res) => {
    const rawSubjectCode = req.query.subject || req.query.subjectCode || 'all';
    const semesterNum = Number(req.user.semester || 1);

    // If a specific subject is requested, ensure it belongs to the student's enrolled semester
    let subjectCode = rawSubjectCode;
    if (subjectCode !== 'all') {
      const foundSub = findSubjectByCodeOrId(subjectCode);
      if (foundSub && foundSub.semester && Number(foundSub.semester) !== semesterNum) {
        // Enforce enrolled semester: fall back to all enrolled subjects
        subjectCode = 'all';
      }
    }

    let plan = await StudyPlan.findOne({ studentId: req.user._id, subjectCode });

    // If no plan yet OR the existing plan was generated for a different semester, regenerate for enrolled semester
    const needsRegen = !plan || Number(plan.semester) !== semesterNum;

    if (needsRegen) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 30);

      const generated = await generateDynamicSchedule(
        req.user._id,
        subjectCode,
        targetDate,
        60,
        semesterNum
      );

      const subInfo =
        subjectCode === 'all'
          ? { name: `Semester ${semesterNum} Comprehensive Study Plan` }
          : findSubjectByCodeOrId(subjectCode) || { name: 'Subject Study Plan' };

      if (plan) {
        plan.subjectName = subInfo.name;
        plan.semester = semesterNum;
        plan.targetDate = targetDate;
        plan.dailyMinutes = 60;
        plan.startDate = new Date();
        plan.schedule = generated.schedule;
        plan.weeklyGoals = generated.weeklyGoals;
        plan.reminders = generated.reminders;
        await plan.save();
      } else {
        plan = await StudyPlan.create({
          studentId: req.user._id,
          subjectCode,
          subjectName: subInfo.name,
          semester: semesterNum,
          targetDate,
          dailyMinutes: 60,
          startDate: new Date(),
          schedule: generated.schedule,
          weeklyGoals: generated.weeklyGoals,
          reminders: generated.reminders
        });
      }
    }

    // Cross-check actual completions in case student completed lessons elsewhere
    const completedDocs = await LessonProgress.find({
      studentId: req.user._id,
      status: 'completed'
    }).lean();
    const completedSet = new Set(completedDocs.map((d) => String(d.lessonId)));

    let updated = false;
    for (const task of plan.schedule) {
      if (task.lessonId && completedSet.has(task.lessonId) && !task.completed) {
        task.completed = true;
        task.completedAt = new Date();
        updated = true;
      }
    }
    if (updated) {
      await plan.save();
    }

    // Calculate completion statistics
    const todayStr = getTodayStr();
    const totalTasks = plan.schedule.length;
    const completedTasks = plan.schedule.filter((t) => t.completed).length;
    const todayTasks = plan.schedule.filter((t) => t.date === todayStr);
    const todayCompleted = todayTasks.filter((t) => t.completed).length;
    const overdueTasks = plan.schedule.filter((t) => t.date < todayStr && !t.completed);

    // Compute weekly completion
    const currentWeekGoal =
      plan.weeklyGoals.find((w) => w.startDate <= todayStr && w.endDate >= todayStr) ||
      plan.weeklyGoals[0] ||
      null;

    const stats = {
      totalTasks,
      completedTasks,
      completionPercent: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      todayTotalTasks: todayTasks.length,
      todayCompletedTasks: todayCompleted,
      todayPercent: todayTasks.length > 0 ? Math.round((todayCompleted / todayTasks.length) * 100) : 0,
      todayMinutes: todayTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0),
      todayCompletedMinutes: todayTasks
        .filter((t) => t.completed)
        .reduce((acc, t) => acc + t.estimatedMinutes, 0),
      overdueTasksCount: overdueTasks.length,
      weeklyProgress: currentWeekGoal
        ? {
            weekNumber: currentWeekGoal.weekNumber,
            targetLessons: currentWeekGoal.targetLessons,
            completedLessons: plan.schedule.filter(
              (t) =>
                t.date >= currentWeekGoal.startDate &&
                t.date <= currentWeekGoal.endDate &&
                t.completed
            ).length,
            targetMinutes: currentWeekGoal.targetMinutes,
            status: currentWeekGoal.status
          }
        : null
    };

    res.json({
      data: {
        plan,
        stats,
        todayTasks,
        overdueTasks,
        upcomingSchedule: plan.schedule.filter((t) => t.date >= todayStr).slice(0, 14),
        completionHistory: plan.schedule.filter((t) => t.completed).slice(-15)
      }
    });
  })
);

/**
 * POST /study-plan
 * Configure or recalculate study plan
 */
const configurePlanSchema = z.object({
  subjectCode: z.string().default('all'),
  targetDate: z.string().min(1),
  dailyMinutes: z.number().int().min(15).max(480).default(60),
  semester: z.number().int().optional()
});

router.post(
  '/',
  authenticate,
  allowRoles('student'),
  validate(configurePlanSchema),
  asyncHandler(async (req, res) => {
    const { subjectCode, targetDate, dailyMinutes } = req.body;
    const semesterNum = Number(req.user.semester || 1);

    if (subjectCode !== 'all') {
      const foundSub = findSubjectByCodeOrId(subjectCode);
      if (foundSub && foundSub.semester && Number(foundSub.semester) !== semesterNum) {
        throw new HttpError(
          403,
          `🔒 Locked: "${foundSub.name}" belongs to Semester ${foundSub.semester}. You are enrolled in Semester ${semesterNum}, so you can only generate study plans for Semester ${semesterNum} courses.`
        );
      }
    }

    const targetDateObj = new Date(targetDate);
    if (isNaN(targetDateObj.getTime())) {
      throw new HttpError(400, 'Invalid target completion date');
    }

    const generated = await generateDynamicSchedule(
      req.user._id,
      subjectCode,
      targetDateObj,
      dailyMinutes,
      semesterNum
    );

    const subInfo =
      subjectCode === 'all'
        ? { name: `Semester ${semesterNum} Comprehensive Study Plan` }
        : findSubjectByCodeOrId(subjectCode) || { name: 'Subject Study Plan' };

    const plan = await StudyPlan.findOneAndUpdate(
      { studentId: req.user._id, subjectCode },
      {
        $set: {
          subjectName: subInfo.name,
          semester: semesterNum,
          targetDate: targetDateObj,
          dailyMinutes,
          startDate: new Date(),
          schedule: generated.schedule,
          weeklyGoals: generated.weeklyGoals,
          reminders: generated.reminders
        },
        $setOnInsert: { studentId: req.user._id, subjectCode }
      },
      { new: true, upsert: true }
    );

    res.json({
      data: {
        success: true,
        plan,
        message: `Personalized study plan created: ${plan.schedule.length} tasks scheduled across ${dailyMinutes} mins/day.`
      }
    });
  })
);

/**
 * POST /study-plan/reschedule
 * Automatically reschedules past unfinished tasks starting from today
 */
router.post(
  '/reschedule',
  authenticate,
  allowRoles('student'),
  asyncHandler(async (req, res) => {
    const subjectCode = req.body.subjectCode || req.query.subjectCode || 'all';
    const plan = await StudyPlan.findOne({ studentId: req.user._id, subjectCode });
    if (!plan) throw new HttpError(404, 'Study plan not found');

    const todayStr = getTodayStr();
    let currDateStr = todayStr;
    const dailyMinutes = plan.dailyMinutes || 60;

    // Get minutes currently committed for today
    let todayMinutes = plan.schedule
      .filter((t) => t.date === todayStr && !t.completed)
      .reduce((acc, t) => acc + t.estimatedMinutes, 0);

    let rescheduledCount = 0;

    for (const task of plan.schedule) {
      if (task.date < todayStr && !task.completed) {
        const originalDate = task.date;
        if (todayMinutes + task.estimatedMinutes > dailyMinutes && todayMinutes > 0) {
          currDateStr = addDays(currDateStr, 1);
          todayMinutes = 0;
        }

        task.rescheduled = true;
        task.rescheduledFrom = originalDate;
        task.date = currDateStr;
        todayMinutes += task.estimatedMinutes;
        rescheduledCount++;
      }
    }

    // Sort schedule chronologically
    plan.schedule.sort((a, b) => a.date.localeCompare(b.date));

    // Update reminder
    plan.reminders.unshift({
      id: `rem-resched-${Date.now()}`,
      type: 'pending_lesson',
      message: `Rescheduled ${rescheduledCount} unfinished tasks into your upcoming study days.`,
      date: todayStr,
      priority: 'medium',
      read: false
    });

    await plan.save();

    res.json({
      data: {
        success: true,
        rescheduledCount,
        plan
      }
    });
  })
);

/**
 * POST /study-plan/tasks/:taskId/toggle
 * Toggle completion of a study task
 */
router.post(
  '/tasks/:taskId/toggle',
  authenticate,
  allowRoles('student'),
  asyncHandler(async (req, res) => {
    const taskId = req.params.taskId;
    const subjectCode = req.body.subjectCode || 'all';

    // Find plan containing this task
    let plan = await StudyPlan.findOne({
      studentId: req.user._id,
      'schedule.id': taskId
    });

    if (!plan) {
      plan = await StudyPlan.findOne({ studentId: req.user._id, subjectCode });
    }
    if (!plan) throw new HttpError(404, 'Study plan or task not found');

    const task = plan.schedule.find((t) => t.id === taskId);
    if (!task) throw new HttpError(404, 'Task not found in plan');

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;

    // Also sync with LessonProgress if it corresponds to an official lesson
    if (task.lessonId) {
      const now = new Date();
      await LessonProgress.findOneAndUpdate(
        { studentId: req.user._id, lessonId: task.lessonId },
        {
          $set: {
            status: task.completed ? 'completed' : 'in_progress',
            completedAt: task.completed ? now : null,
            lastAccessedAt: now,
            ...(task.subjectCode ? { subjectCode: task.subjectCode } : {}),
            ...(task.subjectName ? { subjectName: task.subjectName } : {}),
            ...(task.unitNumber ? { unitNumber: task.unitNumber } : {}),
            ...(task.unitIndex !== undefined ? { unitIndex: task.unitIndex } : {}),
            ...(task.title ? { lessonTitle: task.title } : {})
          },
          $setOnInsert: { studentId: req.user._id, lessonId: task.lessonId }
        },
        { upsert: true }
      );
    }

    await plan.save();

    res.json({
      data: {
        success: true,
        task,
        plan
      }
    });
  })
);

/**
 * GET /study-plan/today
 * Quick query for today's tasks and reminders
 */
router.get(
  '/today',
  authenticate,
  allowRoles('student'),
  asyncHandler(async (req, res) => {
    const todayStr = getTodayStr();
    const plans = await StudyPlan.find({ studentId: req.user._id }).lean();

    const todayTasks = [];
    const allReminders = [];

    for (const plan of plans) {
      const matching = (plan.schedule || []).filter((t) => t.date === todayStr);
      todayTasks.push(...matching);
      allReminders.push(...(plan.reminders || []).filter((r) => !r.read));
    }

    res.json({
      data: {
        todayStr,
        todayTasks,
        totalEstimatedMinutes: todayTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0),
        completedTasksCount: todayTasks.filter((t) => t.completed).length,
        reminders: allReminders.slice(0, 5)
      }
    });
  })
);

export default router;
