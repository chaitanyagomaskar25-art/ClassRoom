import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, CircleHelp, Clock3, RotateCcw, Trophy } from 'lucide-react';
import { api, getErrorMessage, unwrap } from '../services/api.js';
import { EmptyState, ErrorState, LoadingState } from '../components/ContentState.jsx';
import { idOf, listFrom, nameOf, percentage } from '../utils/format.js';

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [error, setError] = useState('');

  const loadQuizzes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setQuizzes(listFrom(unwrap(await api.get('/quizzes')), 'quizzes'));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadQuizzes(); }, [loadQuizzes]);

  async function openQuiz(quiz) {
    setAnswers({});
    setResult(null);
    setError('');
    setQuestionLoading(true);
    try {
      const response = unwrap(await api.get(`/curriculum/lessons/${quiz.lessonId || idOf(quiz)}/quiz`));
      setSelected({ ...quiz, questions: response.questions || [] });
    } catch (requestError) {
      setSelected(quiz);
      setError(getErrorMessage(requestError));
    } finally {
      setQuestionLoading(false);
    }
  }

  async function submitQuiz(event) {
    event.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        answers: selected.questions.map((question, index) => Number(answers[idOf(question) || String(index)])),
      };
      const response = unwrap(await api.post(`/quizzes/${selected.lessonId || idOf(selected)}/submit`, payload));
      setResult(response);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="content-page"><LoadingState label="Loading your quizzes…" /></div>;
  return <div className="content-page">
    <div className="page-heading"><div><span className="eyebrow">PRACTICE MAKES PROGRESS</span><h1>Quizzes</h1><p>Use each quiz as a chance to see how far you've come.</p></div><div className="heading-illustration peach-illustration"><CircleHelp size={23} /></div></div>
    {error && <ErrorState message={error} onRetry={selected ? () => openQuiz(selected) : loadQuizzes} />}
    {!selected ? quizzes.length === 0 ? <EmptyState title="Your quiz library is growing" detail="When a quiz is added to your curriculum, you'll find it here." /> : <div className="quiz-grid">{quizzes.map((quiz, index) => <article className="quiz-card" key={idOf(quiz) || index}><div className={`quiz-card-top quiz-tone-${index % 4}`}><span className="quiz-subject">{quiz.subject ? nameOf(quiz.subject) : quiz.subjectName || 'YOUR CURRICULUM'}</span><span className="quiz-card-icon"><CircleHelp size={21} /></span></div><div className="quiz-card-body"><span className="eyebrow">{quiz.type || 'PRACTICE QUIZ'}</span><h2>{nameOf(quiz)}</h2><p>{quiz.summary || quiz.description || 'A quick check-in to help you build confidence with this subject.'}</p><div className="quiz-meta"><span><CircleHelp size={14} /> {quiz.questions?.length ?? quiz.questionCount ?? '—'} questions</span>{quiz.duration && <span><Clock3 size={14} /> {quiz.duration} min</span>}</div><button className="button button-primary quiz-start" onClick={() => openQuiz(quiz)}>Start quiz <ArrowRight size={15} /></button></div></article>)}</div> : <section className="quiz-taking">
      {!result ? <>
        <button className="text-back" onClick={() => setSelected(null)}><ArrowLeft size={15} /> All quizzes</button>
        <div className="quiz-taking-heading"><div><span className="eyebrow">{selected.subject ? nameOf(selected.subject) : selected.subjectName || 'PRACTICE QUIZ'}</span><h2>{nameOf(selected)}</h2><p>{selected.summary || selected.description || 'Take your time. Learning is not a race.'}</p></div><span className="soft-badge"><CircleHelp size={14} /> {selected.questions?.length || selected.questionCount || 0} questions</span></div>
        {questionLoading ? <LoadingState label="Opening your quiz…" /> : <form onSubmit={submitQuiz} className="question-list">
          {(selected.questions || []).map((question, index) => <fieldset className="question-card" key={idOf(question) || index}><legend><span className="question-number">{String(index + 1).padStart(2, '0')}</span><span>{question.question || question.text || question.prompt}</span></legend><div className="answer-options">{(question.options || question.choices || []).map((option, optionIndex) => {
            const value = typeof option === 'object' ? option.value ?? option._id ?? option.text : option;
            const label = typeof option === 'object' ? option.label || option.text || option.value : option;
            return <label className={`answer-option ${answers[idOf(question) || String(index)] === optionIndex ? 'answer-selected' : ''}`} key={String(value)}><input type="radio" name={idOf(question) || String(index)} value={optionIndex} checked={answers[idOf(question) || String(index)] === optionIndex} onChange={() => setAnswers({ ...answers, [idOf(question) || String(index)]: optionIndex })} required /><span className="answer-radio" /><span>{label}</span></label>;
          })}</div></fieldset>)}
          {selected.questions?.length ? <button disabled={submitting} className="button button-primary submit-quiz">{submitting ? 'Checking your answers…' : 'Submit my answers'} <ArrowRight size={16} /></button> : <EmptyState title="Questions will be added soon" detail="This quiz doesn't have any questions to answer yet." />}
        </form>}
      </> : <div className="quiz-result"><div className="result-icon"><Trophy size={28} /></div><span className="eyebrow">QUIZ COMPLETE</span><h2>Look at you, showing up.</h2><p>Every attempt helps you understand a little more than before.</p><div className="result-score">{percentage(result.attempt?.score ?? result.score ?? result.percentage ?? result.accuracy)}<span>%</span></div><strong className="result-caption">YOUR SCORE</strong>{result.attempt?.correctCount !== undefined && <div className="result-detail"><CheckCircle2 size={16} /> {result.attempt.correctCount} correct out of {result.attempt.totalQuestions || selected.questions?.length || 0}</div>}<div className="result-actions"><button className="button button-secondary" onClick={() => openQuiz(selected)}><RotateCcw size={15} /> Try again</button><button className="button button-primary" onClick={() => setSelected(null)}>Back to quizzes <ArrowRight size={15} /></button></div></div>}
    </section>}
  </div>;
}
