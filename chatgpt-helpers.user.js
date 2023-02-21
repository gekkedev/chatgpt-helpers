// ==UserScript==
// @name         ChatGPT helpers
// @namespace    https://github.com/gekkedev/chatgpt-helpers
// @version      0.1
// @description  adds a few helpful features to the popular website
// @updateURL    https://raw.githubusercontent.com/gekkedev/chatgpt-helpers/master/chatgpt-helpers.user.js
// @downloadURL  https://raw.githubusercontent.com/gekkedev/chatgpt-helpers/master/chatgpt-helpers.user.js
// @author       gekkedev
// @match        *://chat.openai.com/chat
// @match        *://chat.openai.com/chat/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=openai.com
// @grant        none
// ==/UserScript==

/*
 * IDEAS:
 * - settings (switch off char count, etc.)
 * - add shortcut / symbolic meaning buttons (e.g. completeness check, copy&paste, etc.) into appendix function
 * - deeplinks for other A.I. services
 * - prompts: link to competitors as well with the same prompt?
 */
;(function () {
  "use strict"

  /** how many miliseconds to wait between launching another loop */
  const globalInterval = 500
  let initialRunDone = false
  let loopRunning = false
  let wipAnswers = []
  let currentChatPath = ""

  //helpers
  const pimpMyAnswer = (answer) => {
    let appendix = ""
    appendix += "Character count: " + answer.textContent.length
    if (answer.textContent[answer.textContent.length - 1] != ".")
      appendix += "\nAnswer looks broken/incomplete (missing full stop)"

    answer.append(appendix)
  }
  //WIP flag switches between finalized and non-finalized answers
  const getAllAnswers = (wip = false) =>
    document.querySelectorAll(
      ".markdown.prose.w-full.break-words.light" + (wip ? ".result-streaming" : ":not(.result-streaming)")
    )

  const mainLoop = setInterval(() => {
    //if the loop is locked (meaning, this one is a duplicate - it will cancel itself
    if (loopRunning) return
    loopRunning = true //lock the loop to avoid simultaneous runs

    //get references to all anwers
    let answers = getAllAnswers()
    if (!wipAnswers.length)
      //don't overwrite this unless a new one is found
      wipAnswers = getAllAnswers(true) //probably one, but just saying...

    //log the findings (prolly just 4 debugging)
    if (answers) console.log(answers.length + " answers found")
    if (wipAnswers) console.log(wipAnswers.length + " WIP answers found")

    if (!initialRunDone) {
      if (
        document
          .getElementById("headlessui-portal-root")
          ?.textContent.toLowerCase()
          .includes("chatgpt plus is available")
      )
        alert("fixme:wrong blocker detected")

      const blocker = document.getElementById("headlessui-portal-root")
      if (blocker) {
        alert("Click blocker found, removing")
        blocker.parentNode.removeChild(blocker)
      }

      //append a length count to all answers
      console.log("Adding char count to already final answers...")
      answers.forEach((answer) => pimpMyAnswer(answer))
      //to get the answer's content, innerText is better because it contains newlines: \n

      initialRunDone = true
      currentChatPath = location.pathname
    } else {
      if (currentChatPath != location.pathname) {
        console.log("New chat tab detected, resetting state...")
        initialRunDone = false
        wipAnswers = []
      }
    }

    //test for WIP answer completion
    if (wipAnswers.length && !wipAnswers[0].classList.contains("result-streaming")) {
      alert("answer finalized")
      pimpMyAnswer(wipAnswers[0])
      wipAnswers = []
    }

    loopRunning = false
  }, globalInterval)
})()
