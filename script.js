
import { exercises, languageKeys } from './dataStore.js';

document.getElementById('difficultyLevel').addEventListener('change', updateExercises);
document.getElementById('sourceLanguage').addEventListener('change', updateExercises);
document.getElementById('targetLanguage').addEventListener('change', updateExercises);

const exerciseAccessCounts = {};
const repeatLimit = 3;
let completedExercisesCount = 0;

function updateExercises() {
  var level = document.getElementById('difficultyLevel').value;
  var sourceLang = document.getElementById('sourceLanguage').value;
  var targetLang = document.getElementById('targetLanguage').value;

  if (sourceLang === targetLang) {
    alert("Please select two different languages.");
    return;
  }

  loadExercises(level, sourceLang, targetLang, 0);
}

function loadExercises(level, sourceLang, targetLang, exerciseIndex) {

  // Access the exercises based on the level and source language
  var levelExercises = exercises[level][sourceLang];

  // Check if there are exercises for the selected languages and level
  if (!levelExercises || !levelExercises[targetLang] || levelExercises[targetLang].length === 0) {
    alert("No exercises available for the selected languages at this level.");
    return;
  }

  // Ensure the exercise index is within the range
  if (exerciseIndex >= levelExercises[targetLang].length) {
    alert("You have completed all the exercises for this selection.");
    return;
  }

  // Get the specific exercise
  var exercise = levelExercises[targetLang][exerciseIndex];

  // Update the UI with the exercise
  var codeSnippetDiv = document.getElementById('codeSnippet');
  var sourceCode = exercise[languageKeys[sourceLang]]; // "js", "py", "ja", "ph"
  var targetCodeKey = languageKeys[targetLang]; // "js", "py", "ja", "ph"

  codeSnippetDiv.innerHTML =
    `<p>${sourceLang.toUpperCase()}: <code>${sourceCode}</code></p>
       <p>${targetLang.toUpperCase()}: <input type="text" id="userInput" placeholder="Translate to ${targetLang}"></p>`;

  var userInputField = document.getElementById('userInput');
  var feedbackElement = document.getElementById('feedback');

  userInputField.focus();

  userInputField.addEventListener('input', function () {
    var userInput = this.value;
    if (userInput === exercise[targetCodeKey]) {
      feedbackElement.className = 'valid';
      feedbackElement.textContent = 'Correct! Press Tab or Enter for the next exercise.';
    } else if (!exercise[targetCodeKey].startsWith(userInput)) {
      feedbackElement.className = 'invalid';
      feedbackElement.textContent = generateFeedback(level, userInput, exercise[targetCodeKey]);
    } else {
      feedbackElement.textContent = ''; // No feedback while correctly typing
    }
  });

  /*
    Load exercises at random indexes, and an exercise at an index can be accessed up to the repeatLimit.
  */
  userInputField.addEventListener('keydown', function (event) {
    if ((event.key === 'Tab' || event.key === 'Enter') && this.value === exercise[targetCodeKey]) {
      event.preventDefault();
      const totalExercises = levelExercises[targetLang].length;
      if (completedExercisesCount >= totalExercises) {
        codeSnippetDiv.innerHTML = '<p class="highlight">Congratulations! You have completed all exercises in this level.</p>';
        return;
      }
      let exerciseIndex;
      do {
        exerciseIndex = Math.floor(Math.random() * totalExercises);
      } while (exerciseAccessCounts[exerciseIndex] >= repeatLimit);

      exerciseAccessCounts[exerciseIndex] = (exerciseAccessCounts[exerciseIndex] || 0) + 1;

      if (exerciseAccessCounts[exerciseIndex] === repeatLimit) {
        completedExercisesCount++;
      }
      loadExercises(level, sourceLang, targetLang, exerciseIndex);
    }
  });
  console.log("exerciseAccessCounts ", exerciseAccessCounts, " completedExercisesCount ", completedExercisesCount)

  /*
    Load exercises in order from an array list. No repeats.
  */
  // userInputField.addEventListener('keydown', function (event) {
  //   if ((event.key === 'Tab' || event.key === 'Enter') && this.value === exercise[targetCodeKey]) {
  //     event.preventDefault();
  //     var nextIndex = exerciseIndex + 1;
  //     if (nextIndex < levelExercises[targetLang].length) {
  //       loadExercises(level, sourceLang, targetLang, nextIndex);
  //     } else {
  //       codeSnippetDiv.innerHTML = '<p class="highlight">Congratulations! You have completed all exercises for this selection.</p>';
  //     }
  //   }
  // });
}

function generateFeedback(level, userInput, correctSyntax) {
  if (userInput === '') {
    return 'Please enter the Python code.';
  } else {
    switch (level) {
      case 'beginner':
        return `Try again. Hint: ${correctSyntax}`;
      case 'intermediate':
        // Provide every other character as a hint with spaces for missing characters
        var spacedHint = '';
        for (let i = 0; i < correctSyntax.length; i++) {
          spacedHint += i % 2 === 0 ? correctSyntax[i] : ' ';
        }
        return `Not quite right. Here's a hint: ${spacedHint}`;
      case 'advanced':
        return 'Incorrect. Challenge yourself to find the error.';
      default:
        return 'Incorrect. Please review and try again.';
    }
  }
}


// Initial load
updateExercises();