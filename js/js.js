const operators = [
    {system: '+', human: ' + '},
    {system: '-', human: ' - '},
    {system: '*', human: ' x '},
    {system: '*', human: ' x '},
    {system: '*', human: ' x '},
    {system: '/', human: ' : '},
    {system: '/', human: ' : '},
    {system: '/', human: ' : '},
    {system: '/', human: ' : '},
    {system: '/', human: ' : '},
];

let result = {
    tasks: [],
    isInt: function(n) {
        return n % 1 === 0;
    },
    putTask: function () {

        this.closeModal();

        document.querySelector('#input-div input').value = '';

        // let statement = generateStatement();
        let statement = generateStatementV2();
        let humanStatement = [];
        let systemStatement = [];

        statement.forEach(function (statementItem) {
            if (statementItem instanceof Object) {
                humanStatement.push(statementItem.human);
                systemStatement.push(statementItem.system);
            } else {
                humanStatement.push(statementItem);
                systemStatement.push(statementItem);
            }
        })

        let sysSt = systemStatement.join('');
        let res = this.parse(sysSt);

        if (!this.isInt(res) || res > 100 || res < 0) {
            return this.putTask();
        }

        this.tasks.push({
            statement: {
                human: humanStatement.join('') + ' =',
                system: systemStatement.join(''),
            },
            answers: []
        });

        this.printLastTaskStatement();

        this.printResult();

        document.querySelector('#task').style.display = 'block';
        document.querySelector('#input-div input').style.display = 'block';
        document.querySelector('#submit').style.display = 'block';

    },
    lastTaskIndex: function () {
        let index = this.tasks.length - 1;
        return index < 0 ? 0 : index;
    },
    taskCount: function () {
        return this.tasks.length;
    },
    submitAnswerToLastTask: function () {
        let val = document.querySelector('#input-div  input').value;

        if (!val) {
            this.showModal('<span style="color: red;">Atbildes vērtība<br>nav ievadīta,<br> saņemies!</span>');
            return;
        }

        let lastTask = this.lastTask();

        if (lastTask.answers.length > 2) {
            this.showModal('<span style="color: red;">Maksums atbiles 3<br>jau ir iesniegtas,<br> Pieprasi jaunu uzdevumu!</span>');
            return;
        }

        let taskAnswerAllreadySubmitted = false;

        lastTask.answers.forEach(function (answer) {
            if (answer == val) {
                taskAnswerAllreadySubmitted = true;
            }
        });

        if (taskAnswerAllreadySubmitted) {
            if (this.parse(lastTask.statement.system) == val) {
                this.showModal(`<h4 style="color: mediumseagreen;">Atbildi "${val}"<br>šim uzdevumam jau ir iesniegta,<br>tā ir pareize,<br> pieprasi jaunu <br> uzdevumu!</h4>`);
                return;
            }
            this.showModal(`<h4 style="color: red;">Atbildi "${val}"<br>šim uzdevumam jau ir iesniegta,<br>tā joprojām nav pareize,<br> saņemies!</h4>`);
            return;
        }

        lastTask.answers.push(val);
        this.tasks[this.lastTaskIndex()] = lastTask;
        this.printResult();

        console.log({
            submitted: val,
            correct: this.parse(lastTask.statement.system),
        })

        if (this.parse(lastTask.statement.system) == val) {
            this.showModal(
                `<h1 style="color: green">woohoo!</h1> <span>Atbilde pareiza!</span><span> ${lastTask.statement.human} ${val}</span>
<button onclick="result.closeModalAndCreateNewTask()">Gribu jaunu uzdevumu!</button>`
            );
            document.querySelector('#task').style.display = 'none';
            document.querySelector('#input-div input').style.display = 'none';
            document.querySelector('#submit').style.display = 'none';
        } else {
            this.showModal(
                `<h1 style="color: red">Fail!</h1> <span>Atbilde nav pareiza!</span><span> ${lastTask.statement.human} nav ${val}</span>`);
        }

        if (this.tasks[this.lastTaskIndex()].answers.length > 2) {
            document.querySelector('#task').style.display = 'none';
            document.querySelector('#input-div input').style.display = 'none';
            document.querySelector('#submit').style.display = 'none';
        }
    },
    lastTask: function () {
        return this.tasks[this.lastTaskIndex()];
    },
    parse: function (str) {
        return Function(`'use strict'; return (${str})`)()
    },
    showModal: function (text) {
        let modal = document.querySelector('#modal');

        modal.querySelector('div').innerHTML = text;
        modal.style.display = 'block';
    },
    closeModalAndCreateNewTask() {
        document.querySelector('#modal').style.display = 'none';
        this.putTask();
    },
    closeModal: function () {
        document.querySelector('#modal').style.display = 'none';
    },
    printResult: function () {
        document.querySelector('#task-count').innerHTML = this.taskCount();
        const statements = document.querySelector('#statements');

        statements.querySelectorAll('div').forEach(function (el, i) {
            if (i > 2) {
                el.remove()
            }
        })

        let correctAnswers = 0;

        let counter = this.tasks.length;

        let taskClone = JSON.parse(JSON.stringify(this.tasks));

        taskClone.reverse().forEach((task) => {
            const div = document.createElement('div');
            div.innerHTML = counter-- + ') ' + task.statement.human;
            statements.appendChild(div);

            let isAnswerCorrect = false;

            task.answers.forEach((answer) => {
                if (!isAnswerCorrect) {
                    isAnswerCorrect = this.parse(task.statement.system) == answer;
                }
            })

            const div1 = document.createElement('div');
            div1.innerHTML = task.answers.join(',');
            statements.appendChild(div1)

            const div2 = document.createElement('div');
            div2.innerHTML = task.answers.length ? (isAnswerCorrect ? '<span style="color: green">ja</span>' : '<span style="color: red">ne</span>') : '';
            statements.appendChild(div2)

            if (isAnswerCorrect) {
                correctAnswers++;
            }
        });

        let rate = 0;

        if (this.tasks.length) {

            let taskCount = this.tasks.length;

            let lastTask = this.lastTask();
            if (!lastTask.answers.length) {
                taskCount--;
            }

            if (taskCount) {
                rate = correctAnswers / taskCount * 100;
            }
        }

        document.querySelector('#score').innerHTML = Math.round(rate) + '%';

        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    },
    initData: function () {
        let tasks = localStorage.getItem('tasks');
        tasks = JSON.parse(tasks);

        if (tasks) {
            this.tasks = tasks;
        }
    },
    printLastTaskStatement: function () {
        document.querySelector('#task').innerHTML = this.lastTask().statement.human;
    },
    test: function () {
        alert('test');
    },
    clear: function () {

        this.closeModal();

        if(this.hash(document.querySelector('#pass').value) !== -782177199)
        {
            this.showModal(`<h4 style="color: red;">incorrect pass, sorry</h4>`);
            return;
        } else {
            this.showModal(`<h4 style="color: green;">Storage cleared!</h4>`);
        }

        localStorage.setItem('tasks', JSON.stringify([]));
        this.tasks = [];
        this.printResult();
    },
    hash: function (string) {
        var hash = 0;

        if (string.length == 0) return hash;

        for (i = 0; i < string.length; i++) {
            char = string.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        return hash;
    }
};

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomOperator() {
    const totalOperators = operators.length;

    return operators[randomInteger(0, totalOperators - 1)]
}

function generateStatement() {
    let stack = [];

    stack.push(randomInteger(1, 20));
    stack.push(randomOperator());
    stack.push(randomInteger(1, 20));

    if (randomInteger(1, 2) === 1) {
        stack.push(randomOperator());
        stack.push(randomInteger(1, 20));
    }

    if (randomInteger(1, 2) === 1) {
        let newStack = [];

        let open = false;
        let close = false;

        stack.forEach(function (item){

            if(!(item instanceof Object)){
                if(!open && randomInteger(1, 2) === 1){
                    newStack.push('(');
                    open = true;
                }

                newStack.push(item);
            } else {
                if(open && !close && randomInteger(1, 2) === 1){
                    newStack.push(')');
                    close = true;
                }
                newStack.push(item);
            }

        })

        if(open && !close){
            newStack.push(')');
        }

        stack = newStack;
    }

    return stack;
}

function generateStatementV2(){

    let getResult = function(stack){
        let statement = [];
        stack.forEach(function(item){
            if(item instanceof Object){
                statement.push(item.system);
            } else {
                statement.push(item);
            }
        })

        return result.parse(statement.join(''))
    }

    let isResultNormal = function(calculatedResult){
        if(calculatedResult < 0){
            return false;
        }
        if(calculatedResult > 100){
            return false;
        }
        return result.isInt(calculatedResult);
    }

    let getSimpleStatement = function (){
        let tempStack = []
        tempStack.push(randomInteger(1, 40));
        tempStack.push(randomOperator());
        tempStack.push(randomInteger(1, 40));
        return tempStack;
    }

    let stack = getSimpleStatement();
    let calcResult = getResult(stack);
    if (!isResultNormal(calcResult)) {
        return generateStatementV2();
    }

    let needBrackets = randomInteger(1, 2) === 1;

    if(needBrackets){
        let bufferStack = stack;
        stack = [];
        stack.push('(')
        bufferStack.forEach(function (item){
            stack.push(item);
        })
        stack.push(')')
    }

    let needThirdArg = randomInteger(1, 4) !== 1

    if(needThirdArg){
        let addThirdArgAtBegining = randomInteger(1, 2) === 1;

        let operator = randomOperator();

        if(operator.system === ':'  && addThirdArgAtBegining && needBrackets){
            let bufferStack = stack;
            stack = [];
            stack.push(randomInteger(0, 40));
            stack.push(operator);
            bufferStack.forEach(function (item){
                stack.push(item);
            })
        } else {
            stack.push(operator);
            stack.push(randomInteger(0, 40));
        }
    }

    let calcResult2 = getResult(stack);
    if (!isResultNormal(calcResult2)) {
        console.log('second statement not normal');
        return generateStatementV2();
    }

    let shouldAllWrapInBrackets = randomInteger(1, 5) === 1;

    if(shouldAllWrapInBrackets){
        let bufferStack = stack;
        stack = [];
        stack.push('(');
        bufferStack.forEach(function (item){
            stack.push(item);
        });
        stack.push(')');
    }

    return stack;
}

window.addEventListener("DOMContentLoaded", (event) => {

    result.initData();
    result.printResult();

    const task = document.querySelector('#task');
    const generateTaskBtn = document.querySelector('button#generate');
    const submitBtn = document.querySelector('button#submit');
    const inputDiv = document.querySelector('#input-div');
    const input = document.querySelector('#input-div input');
    const getMeAwayBtn = document.querySelector('#get-me-away');
    const nextBtn = document.querySelector('#next');
    const closeBtn = document.querySelector('#modal > span');

    generateTaskBtn.addEventListener('click', function (event) {
        task.style.display = 'block';
        inputDiv.style.display = 'block';
        generateTaskBtn.style.display = 'none';
        submitBtn.style.display = 'block';
        getMeAwayBtn.style.display = 'block';
        nextBtn.style.display = 'block';

        let lastTask = result.lastTask();

        if(lastTask && lastTask.answers && lastTask.answers.length <3){
            result.printResult();
            result.printLastTaskStatement();
            return;
        }

        result.putTask();
    });

    submitBtn.addEventListener('click', function (event) {
        result.submitAnswerToLastTask();
    })

    getMeAwayBtn.addEventListener('click', function (event) {
        let modal = document.querySelector('#modal');
        modal.querySelector('div').innerHTML = 'Game over!';
        modal.style.display = 'block';
    })

    nextBtn.addEventListener('click', function (event) {
        result.putTask();
    })

    closeBtn.addEventListener('click', function () {
        document.querySelector('#modal').style.display = 'none';
    });

    document.querySelector('#clearBtn').addEventListener('click', function () {
        result.showModal('wana clear? <label>pass:<input type="password" id="pass"><button onclick="result.clear()">go</button></label>');
    });
});