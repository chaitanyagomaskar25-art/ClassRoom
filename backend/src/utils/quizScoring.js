function gradeQuiz(questions, answers) {
  const correctCount = questions.reduce(
    (count, question, index) => count + Number(question.correctOption === answers[index]), 0
  );
  return {
    correctCount,
    totalQuestions: questions.length,
    score: questions.length ? Math.round(correctCount / questions.length * 100) : 0
  };
}

export default gradeQuiz;
