// ==UserScript==
// @name         fessorBot
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  Lav XP i MatematikFessor
// @author       HarshWombat ( https://github.com/HarshWombat )
// @match        https://www.matematikfessor.dk/test/*
// @grant        none
// @require      https://smtpjs.com/smtp.js
// ==/UserScript==

function init() {
    'use strict';
    var loadCheck,
        pathName = window.location.pathname;
    if (pathName.match(/^\/test\/fivesharp\/$/)) { //Hvis vi er ved en "fivesharp" test
        loadCheck = setInterval(function () {
            if (document.getElementsByClassName("nextButton")[0] && !document.getElementsByClassName("nextButton disabled")[0]) {
                testLoaded();
                clearInterval(loadCheck);
            }
        }, 100);
    } else if (pathName.match(/^\/test\/result\/\d+$/)) { //Hvis vi er ved resultatet af en test
        loadCheck = setInterval(function () {
            if (document.getElementById("recreateTestBtn") && document.getElementsByClassName("evaluateAnswer")[0]) {
                resultLoaded();
                clearInterval(loadCheck);
            }
        }, 100);
    }
}

function testLoaded() {
    var testType = document.getElementsByClassName("no-link")[0].innerHTML;
    switch (testType) {
        case "Gang med 0":
            saveAnswers([0, 0, 0, 0, 0]);
            break;
    }
}

function saveAnswers(answers) {
    'use strict';
    var userInfo = JSON.parse(loadJsPage.toString(10).match(/{"reloadUserData":[\s\S]*?}}\);/)[0].replace(/\);/, "")),
        testInfo = JSON.parse(loadJsPage.toString(10).match(/{"questions":\[{"Question":[\s\S]*?}}\);/)[0].replace(/\);/, "")),
        xhr,
        returned = [];
    for (let i = 0; i < answers.length; i += 1) {
        xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://www.matematikfessor.dk/test/save_answer', true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=utf-8");
        xhr.setRequestHeader("X-User-Id", userInfo.userData.id);
        xhr.setRequestHeader("X-Timestamp-Sent", new Date().getTime());
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.onloadend = function () {
            returned[i] = true;
            if (returned.indexOf(false) === -1) {
                finishTest();
            }
        };
        returned[i] = false;
        xhr.send("data%5Bquestion_id%5D=" + testInfo.questions[i].Question.id + "&data%5Banswer%5D=" + answers[i] + "&data%5Btest_id%5D=" + testInfo.testSettings.Test.id + "&data%5Bmodel%5D=" + testInfo.testSettings.model);
    }
}

function finishTest() {
    'use strict';
    var loadCheck;
    document.getElementsByClassName("big actionButton primary")[0].click();
    loadCheck = setInterval(function () {
        if (document.getElementsByClassName("big actionButton primary")[1]) {
            document.getElementsByClassName("big actionButton primary")[1].click();
            clearInterval(loadCheck);
        }
    }, 100);
}

function resultLoaded() {
    var i,
        isTarget = false,
        loadCheck;
    for (i = 0; i < document.getElementsByClassName("no-link").length; i += 1) {
        if (document.getElementsByClassName("no-link")[i].innerHTML === "Resultat for: Gang med 0") {
            isTarget = true;
        }
    }
    if (isTarget) {
        document.getElementById("recreateTestBtn").click();
        loadCheck = setInterval(function () {
            document.getElementById("recreateTestBtn").click();
            if (document.getElementsByClassName("big actionButton primary")[0]) {
                document.getElementsByClassName("big actionButton primary")[0].click();
                clearInterval(loadCheck);
            }
        }, 100);
    }
}

init();
