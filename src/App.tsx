// Uncomment the following line if you are using Next.js:
// 'use client'

import { Survey } from 'survey-react-ui';
import { CurrentPageChangingEvent, Model, QuestionFileModel, QuestionSignaturePadModel, SurveyModel } from 'survey-core';
import 'survey-core/defaultV2.min.css';
import Logo from './image.png';

import React, { useEffect, useState, useRef } from 'react';
import LoadingDots from './loadingDots';

// Survey configuration object
const defaultSurveyJSON = {
    title: "Epidemiological Risk Assessment Tool (ERAT)",
    description: "Please complete the following questions to receive your personalized risk assessment score.",
    pages: [
        {
            "name": "welcome_page",
            "elements": [
                {
                    "type": "html",
                    "name": "welcomeMessage",
                    "html": "<h2>Welcome to ERAT</h2><p>This tool is designed to help assess risk levels for epidemiological factors in a safe, secure, and private manner. We are committed to ensuring the highest standards of privacy for your data.</p>"
                },
                {
                    "type": "image",
                    "name": "welcomeImage",
                    "imageLink": Logo,
                    "imageFit": "cover"
                },
                {
                    "type": "html",
                    "name": "nextStepInfo",
                    "html": "<p>Click <strong>Next</strong> to proceed to the instructions on how to complete the assessment.</p>"
                }
            ]
        },
        {
            "name": "instructions_page",
            "elements": [
                {
                    "type": "html",
                    "name": "instructionsHeader",
                    "html": "<h3>How to Use ERAT</h3>"
                },
                {
                    "type": "panel",
                    "name": "instructionsPanel",
                    "elements": [
                        {
                            "type": "html",
                            "name": "instruction1",
                            "html": "<strong>Step 1:</strong> Upload necessary documents for identification and verification. These help us validate your identity and maintain a secure environment."
                        },
                        {
                            "type": "html",
                            "name": "instruction2",
                            "html": "<strong>Step 2:</strong> Answer a series of questions about your recent travel, health, and exposure history. Be as accurate as possible."
                        },
                        {
                            "type": "html",
                            "name": "instruction3",
                            "html": "<strong>Step 3:</strong> Review your responses before submission. Once complete, you’ll receive a confirmation and guidance on next steps based on your risk assessment."
                        }
                    ],
                    "title": "Follow these steps carefully:"
                },
                {
                    "type": "html",
                    "name": "nextStepInfo",
                    "html": "<p>Click <strong>Next</strong> when you're ready to begin.</p>"
                }
            ]
        },
        {
            "name": "confirmation_page",
            "elements": [
                {
                    "type": "html",
                    "name": "confirmationMessage",
                    "html": "<h3>You're All Set!</h3><p>Now that you’re familiar with the process, you can start your assessment. Rest assured that your data is encrypted and stored securely. We’re here to guide you at every step.</p>"
                },
                {
                    "type": "html",
                    "name": "beginInfo",
                    "html": "<p>Click <strong>Next</strong> to begin your journey with ERAT.</p>"
                }
            ]
        },
        {
            name: "eligibility",
            elements: [
                {
                    type: "checkbox",
                    name: "confirmEligibility",
                    title: "Please confirm:",
                    isRequired: true,
                    choices: [
                        { value: "age", text: "I am 18 years of age or older." },
                        { value: "consent", text: "I consent to provide accurate information." },
                    ],
                    validators: [
                        { type: "expression", expression: "{confirmEligibility.length} = 2" }
                    ]
                }
            ]
        },
        {
            name: "passport_upload",
            elements: [
                {
                    type: "file",
                    name: "passportFront",
                    title: "Upload the front of your passport",
                    storeDataAsText: false,
                    maxSize: 1024000,
                    acceptedTypes: "image/jpeg, image/png"
                },
                {
                    type: "file",
                    name: "passportBack",
                    title: "Upload the back of your passport",
                    storeDataAsText: false,
                    maxSize: 1024000,
                    acceptedTypes: "image/jpeg, image/png"
                }
            ]
        },
        {
            name: "account_status",
            elements: [
                {
                    type: "html",
                    name: "statusMessage",
                    html: "Retrieving your account status. Please wait..."
                }
            ],
            visibleIf: "{accountStatusLoaded} = true"
        },
        {
            name: "health_information",
            elements: [
                {
                    type: "radiogroup",
                    name: "recentSymptoms",
                    title: "In the last 14 days, have you experienced any of the following symptoms?",
                    isRequired: true,
                    choices: ["Fever", "Cough", "Shortness of Breath", "None of the above"]
                },
                {
                    type: "checkbox",
                    name: "healthConditions",
                    title: "Do you have any pre-existing health conditions? (Select all that apply)",
                    choices: ["Diabetes", "Heart Disease", "Chronic Respiratory Disease", "None"]
                }
            ]
        },
        {
            name: "travel_history",
            elements: [
                {
                    type: "radiogroup",
                    name: "internationalTravel",
                    title: "Have you traveled internationally in the past 30 days?",
                    isRequired: true,
                    choices: ["Yes", "No"]
                },
                {
                    type: "dropdown",
                    name: "visitedCountries",
                    title: "If yes, select the countries you have visited:",
                    visibleIf: "{internationalTravel} = 'Yes'",
                    isRequired: true,
                    choicesByUrl: {
                        url: "https://restcountries.com/v3.1/all",
                        valueName: "name.common",
                        titleName: "name.common"
                    },
                    multiSelect: true
                }
            ]
        },
        {
            name: "vaccination_status",
            elements: [
                {
                    type: "radiogroup",
                    name: "covidVaccine",
                    title: "Have you received a COVID-19 vaccination?",
                    isRequired: true,
                    choices: ["Yes", "No"]
                },
                {
                    type: "radiogroup",
                    name: "boosterShot",
                    title: "Have you received a booster shot?",
                    isRequired: true,
                    visibleIf: "{covidVaccine} = 'Yes'",
                    choices: ["Yes", "No"]
                }
            ]
        }
    ],
    triggers: [
        {
            type: "runExpression",
            expression: "{passportFront} notempty and {passportBack} notempty",
            setToName: "accountStatusLoaded",
            setValue: true
        }
    ],
    showQuestionNumbers: "off",
    completedHtml: "<h4>Thank you for completing the Assesment!</h4>",
    startSurveyText: "Start Assessment",
    pagePrevText: "Back",
    pageNextText: "Next"
};

const App: React.FC = () => {
    const [surveyData, setSurveyData] = useState(defaultSurveyJSON);
    const [isSurveyLoaded, setSurveyLoaded] = useState(false);

    const surveyModelRef = useRef(new Model(defaultSurveyJSON));

    const onComplete = (survey: SurveyModel) => {
        // Handle survey completion
        console.log("Survey Results:", survey.data);
        setSurveyLoaded(false);
    };

    const onUploadFiles = (survey: SurveyModel, options: QuestionFileModel | QuestionSignaturePadModel) => {
        setSurveyLoaded(false);
        setTimeout(() => {
            setSurveyLoaded(true);
            // options.callback(options.files);
        }, 1000);
    };

    const onNextPage = async (survey: SurveyModel, options: CurrentPageChangingEvent) => {
        // survey.setPropertyValue('showNavigationButtons', false);
        if (survey.currentPageNo === survey.pageCount - 1) {
            survey.isSinglePage = true;
        }
    };

    useEffect(() => {
        setTimeout(() => {
            setSurveyLoaded(true);
        }, 2000);
    }, []);
    
    return (
        <div className="App">
            <div className={isSurveyLoaded ? "" : "hidden"}>
                <Survey 
                    model={surveyModelRef.current} 
                    onCurrentPageChanging={onNextPage} 
                    onComplete={onComplete} 
                    onUploadFiles={onUploadFiles} 
                />
            </div>
            <div className={`loading-overlay ${isSurveyLoaded ? "hidden" : ""}`}>
                <LoadingDots />
            </div>
        </div>

    );
};

export default App;
