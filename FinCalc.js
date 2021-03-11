// https://stackoverflow.com/questions/35689061/drag-and-drop-to-inside-a-form
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    let img = ev.target.parentNode;
    ev.dataTransfer.setData("text", ev.target.id);
    ev.dataTransfer.setDragImage(img, 100, 10);
}

function drop(ev) {
    ev.preventDefault();
    let outputForm = document.getElementById('output');
    let inputForm = document.getElementById('inputs');
    let newoutput = document.getElementById(ev.dataTransfer.getData("text")).parentNode;

    let oldoutput = getOutputDiv();
    if (oldoutput !== undefined) {
        inputForm.appendChild(oldoutput);
    }
    outputForm.appendChild(newoutput);
    sortInputForm();
}

function sortInputForm() {
    let sortorder = ['pvd', 'rd', 'pmtd', 'nd', 'fvd'];
    let inputForm = document.getElementById('inputs');

    for (let item of sortorder.reverse()) {
        let div = document.getElementById(item);
        if (div !== undefined && div.parentElement.id !== "output") {
            inputForm.insertBefore(div, inputForm.firstChild);
        }
    }
}

function getOutputDiv() {
    return document.getElementById('output').getElementsByTagName('div')[0];
}

function updateForm() {
    setError();
    const outputid = getOutputDiv().querySelector('input').id;
    document.getElementById(outputid).value = "";

    let result = NaN;
    try {
        result = calculate(outputid);
    } catch (err) {
        setError(err, false);
        return;
    }
    document.getElementById(outputid).value = round(result);
}

function calculate(outputid) {
    const [pv, r, n, fv, pmt, k, isBeginning] = ['pv', 'r', 'n', 'fv', 'pmt', 'k', 'pb'].map(id => getValue(id));
    const result = new InvestmentValueCalculator(pv, r, n, pmt, fv, k, isBeginning).compute(outputid);
    if ([Infinity, NaN, undefined].includes(result)) {
        throw `Result is ${result}.`;
    }
    return result;
}


function getValue(input) {
    let el = document.getElementById(input);
    let value = 0;
    if (input === "k") {
        value = getFrequency(el);
    } else if (input === "pb") {
        value = el.checked;
    } else {
        value = parseFloat(el.value);
    }
    return isNaN(value) ? 0 : value;
}

function getFrequency(el) {
    switch (el.value) {
        case 'Annually':
            return 1;
        case 'Semiannually':
            return 2;
        case 'Quarterly':
            return 4;
        case 'Monthly':
            return 12;
        default:
            return NaN;
    }
}

function round(result) {
    return Math.round(result * 100) / 100
}

function setError(msg = "", hide = true) {
    document.getElementById("errorMessage").innerText = msg;
    document.getElementById("errorMessage").hidden = hide;
}