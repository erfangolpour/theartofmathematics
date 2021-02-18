var chart_element = document.getElementById("chart")
var chart_triggered = false
var chart;

if (sessionStorage.getItem("already_visited") != "1") {
    document.querySelector(".instructions").style.display = "block"
    document.querySelector(".instructions").style.visibility = "visible"
    document.querySelector(".instructions").style.opacity = "1"
    document.querySelector(".blur-background").style.visibility = "visible"
    document.querySelector(".blur-background").style.opacity = "1"
    sessionStorage.setItem("already_visited", "1");
}

var defined_functions = []
document.querySelectorAll(".function-filter-menu div").forEach(el => {defined_functions.push(el.innerText)})

document.querySelector(".blur-background").addEventListener("click", e => {
    document.querySelector(".function-details").style.opacity = "0"
    document.querySelector(".function-details").style.visibility = "hidden"
    document.querySelector(".instructions").style.opacity = "0"
    document.querySelector(".instructions").style.visibility = "hidden"
    document.querySelector(".instructions").style.display = "none"
    e.currentTarget.style.opacity = "0"
    e.currentTarget.style.visibility = "hidden"
});

var general_forms = {'Linear': 'y=x', 'Quadratic': 'y=x^2', 'Cubic': 'y=x^3', 'Absolute Value': 'y=\\left\\lvert x \\right\\rvert', 'Square Root': 'y=\\sqrt{x}', 'Logarithmic': '\\log_c x \\;\\ \\small{\\textsf{(c = the base of the logarithm)}}', 'Constant': 'y=c \\;\\ \\small{\\textsf{(c = the constant term)}}', 'Half-Circle': 'y=\\sqrt{r^2 - x^2} \\;\\ \\small{\\textsf{(r = radius of the circle)}}'}

function num_range(start, end, step=1) {
    return [...Array(Math.floor((end - start) / step)).keys()].map(i => step*i + start)
}

function find_range(f) {
    range_max = chart.data.series[f.index].data[0].y
    range_min = chart.data.series[f.index].data[0].y
    chart.data.series[f.index].data.forEach(point => {
        if (point.y < range_min) {range_min = point.y}
        else if (point.y > range_max) {range_max = point.y}
    })

    return [Math.round((range_min + Number.EPSILON) * 10) / 10, Math.round((range_max + Number.EPSILON) * 10) / 10]
}

king_functions = [
    {title: "Linear", equation: "0.6x + 18", evaluate: x => {return 0.6*x+18}, domain: [-8, 12, 1], tension: 0},
    {title: "Linear", equation: "0.6x - 17", evaluate: x => {return 0.6*x-17}, domain: [-9, 9, 1], tension: 0},
    {title: "Absolute Value", equation: "\\left\\lvert x + 32.5 \\right\\rvert + 26", evaluate: x => {return Math.abs(x+32.5)+26}, domain: [-45, -19, 1], tension: 0},
    {title: "Absolute Value", equation: "-\\left\\lvert x - 33 \\right\\rvert - 24", evaluate: x => {return -Math.abs(x-33)-24}, domain: [20, 47, 1], tension: 0},
    {title: "Quadratic", equation: "0.006 \\times x^2 - 28", evaluate: x => {return 0.006*Math.pow(x, 2)-28}, domain: [18, 48, 1], tension: 2},
    {title: "Cubic", equation: "0.08x^3", evaluate: x => {return Math.pow(0.08*x, 3)}, domain: [-25, 25, 1], tension: 2},
    {title: "Square Root", equation: "\\sqrt{8 \\times (x+50)}+11", evaluate: x => {return Math.sqrt(8*(x+50))+11}, domain: [-47, -17, 1], tension: 2},
    {title: "Square Root", equation: "\\sqrt{55 \\times (x-5)}", evaluate: x => {return Math.sqrt(55*(x-5))}, domain: [5, 16, 1], tension: 2},
    {title: "Logarithmic", equation: "21 \\times \\log_{0.1} -(x + 4)", evaluate: x => {return 21*Math.log(-(x+4))/Math.log(0.1)}, domain: [-17, -4, 1], tension: 2},
    {title: "Constant", equation: "48", evaluate: x => {return 48}, domain: [-23, 30, 1], tension: 0},
    {title: "Constant", equation: "-46", evaluate: x => {return -46}, domain: [-30, 23, 1], tension: 0},
    {title: "Half-Circle", equation: "\\sqrt{7^2 - (x + 26)^2} + 38", evaluate: x => {return Math.sqrt(49-(x+26)**2)+38}, domain: [-32, -19, 1], tension: 2},
]

house_functions = [
    {title: "Linear", equation: "0.6x + 18", evaluate: x => {return 1.2*x-45}, domain: [47, 68, 1], tension: 0},
    {title: "Linear", equation: "0.02x - 15", evaluate: x => {return 0.02*x-15}, domain: [-45, 4, 1], tension: 0},
    {title: "Linear", equation: "0.17x - 42", evaluate: x => {return 0.17*x-42}, domain: [-66, 5, 1], tension: 0},
    {title: "Linear", equation: "0.6x + 42", evaluate: x => {return 0.36*x-53}, domain: [-10, 31, 1], tension: 0},
    {title: "Absolute Value", equation: "-\\left\\lvert 0.9 \\times (x - 14) \\right\\rvert + 52", evaluate: x => {return -Math.abs(0.9*(x-14))+52}, domain: [-10, 36, 1], tension: 0},
    {title: "Absolute Value", equation: "-\\left\\lvert 0.9 \\times (x + 19) \\right\\rvert + 35", evaluate: x => {return -Math.abs(0.9*(x+19))+35}, domain: [-34, -3, 1], tension: 0},
    {title: "Quadratic", equation: "-0.03 \\times (x - 16)^2 - 19", evaluate: x => {return -0.03*Math.pow(x-16, 2)-19}, domain: [7, 27, 1], tension: 2},
]

available_charts = [
    {image: 'img/king.png', functions: king_functions},
    {image: 'img/house.jpg', functions: house_functions},
]

function add_function_preview(f) {
    let function_range = find_range(f)
    let function_type = defined_functions.includes(f.title) ? f.title.replace(" ", "").toLowerCase() : "other"

    let mainNode = document.createElement("div")
    mainNode.className = "function-preview"
    mainNode.setAttribute("series", f.id)
    mainNode.setAttribute("f-type", function_type)

    let titleNode = document.createElement("div")
    titleNode.className = "title"
    titleNode.innerText = f.title + (function_type == "other" ? "" : " #" + (document.querySelectorAll(`[f-type=${function_type}]`).length + 1))

    let discriptionNode = document.createElement("div")
    discriptionNode.className = "discription"
    discriptionNode.innerHTML = `<div>Equation: \\(${f.equation}\\)</div>`
    discriptionNode.innerHTML += `<div>Domain: \\(\\small{${f.domain[0]} \\leqslant x \\leqslant ${f.domain[1]}}\\)</div>`
    discriptionNode.innerHTML += `<div>Range: \\(\\small{${function_range[0]} \\leqslant y \\leqslant ${function_range[1]}}\\)</div>`

    let axisContainer = document.createElement("div")
    axisContainer.className = "preview-axis-container"

    let axisNode = chart_element.cloneNode(true)
    axisNode.style.width = chart_element.offsetWidth + "px"
    axisNode.style.height = chart_element.offsetHeight + "px"

    functionNode = document.querySelector(`.ct-series-${f.id}`).cloneNode(true)
    axisNode.children[0].children[1].innerHTML = ""
    axisNode.children[0].children[1].appendChild(functionNode)

    let x_p = (f.domain[0] + f.domain[1]) / 2
    let y_p = (function_range[0] + function_range[1]) / 2
    // let zoom_rate = 1.4 - Math.max(Math.abs(f.domain[1] - f.domain[0]), Math.abs(function_range[1] - function_range[0])) / 100
    
    if (Math.abs(x_p) > 30) {x_p = Math.sign(x_p) * 30}
    if (Math.abs(y_p) > 50) {y_p = Math.sign(y_p) * 50}
    
    zoom_rate = 1.2

    axisNode.style.transform = "scale(" + zoom_rate + ") " + "translate(" + (((-chart_element.offsetWidth / 2) - x_p * (chart_element.offsetWidth / 100)) / zoom_rate) + "px, " + (((-chart_element.offsetHeight / 2) + y_p * (chart_element.offsetHeight / 100)) / zoom_rate) + "px)"

    axisContainer.appendChild(axisNode)
    mainNode.appendChild(axisContainer)
    mainNode.appendChild(titleNode)
    mainNode.appendChild(discriptionNode)
    document.querySelector(".functions-list").appendChild(mainNode)

    mainNode.addEventListener("mouseover", () => {document.querySelector(`.ct-series-${f.id}`).children[0].style.stroke = "yellow"})
    mainNode.addEventListener("mouseleave", () => {document.querySelector(`.ct-series-${f.id}`).children[0].style.stroke = "white"})
    mainNode.addEventListener("click", e => {
        let blur_background = document.querySelector(".blur-background")
        let function_modal = document.querySelector(".function-details")
        let function_explanation = document.querySelector(".function-explanation")
        let function_graph = document.querySelector(".function-graph")
        
        let keypoints = []
        num_range(...f.domain).forEach((x) => {
            if (Number.isInteger(f.evaluate(x))) {
                keypoints.push([x, f.evaluate(x)])
            }
        })

        // Only 10 key points are allowed
        keypoints_overflow = false
        if (keypoints.length > 10) {
            for (i = 3; keypoints.length > 10; i += 3) {
                keypoints.splice(i, 1)
                keypoints.splice(-i, 1)
            }
            keypoints_overflow = true
        }

        let discriptionNode = document.createElement("div")
        discriptionNode.innerHTML = `<div class="function-title">\\(y=${f.equation}\\)</div>`
        discriptionNode.innerHTML += `<br/><div>Type: <span style="color: #ccc">${f.title}</span></div>`
        discriptionNode.innerHTML += `<div>General Form: <span style="color: #ccc;">\\(${general_forms[f.title]}\\)</span></div>`
        discriptionNode.innerHTML += `<div>Domain: <span style="color: #ccc">\\(${f.domain[0]} \\leqslant x \\leqslant ${f.domain[1]}\\)</span></div>`
        discriptionNode.innerHTML += `<div>Range: <span style="color: #ccc">\\(${function_range[0]} \\leqslant y \\leqslant ${function_range[1]}\\)</span></div>`
        keypoints_html = '<div>Key Points: '
        if (keypoints.length) {
            keypoints.forEach(p => {
                keypoints_html += `<span style="padding: 6px 8px; margin-right: 10px; background-color: #444; color: #ccc; border-radius: 5px;">${p[0]}, ${p[1]}</span>`
            })
            if (keypoints_overflow) {keypoints_html += "..."}
        } else {
            keypoints_html += "<span style='color: #ccc'>No key points found.</span>"
        }
        keypoints_html += '</div>'
        discriptionNode.innerHTML += keypoints_html

        let axisNode = chart_element.cloneNode(true)
        axisNode.style.width = chart_element.offsetWidth + "px"
        axisNode.style.height = chart_element.offsetHeight + "px"
    
        functionNode = document.querySelector(`.ct-series-${f.id}`).cloneNode(true)
        axisNode.children[0].children[1].innerHTML = ""
        axisNode.children[0].children[1].appendChild(functionNode)
        // let zoom_rate = window.innerHeight * window.innerWidth * 0.000003 - Math.max(Math.abs(f.domain[1] - f.domain[0]), Math.abs(function_range[1] - function_range[0])) / 100

        zoom_rate = 1.8

        axisNode.style.transform = "scale(" + zoom_rate + ") " + "translate(" + (((-chart_element.offsetWidth / 2) - x_p * (chart_element.offsetWidth / 100)) / zoom_rate) + "px, " + (((-chart_element.offsetHeight / 2) + y_p * (chart_element.offsetHeight / 100)) / zoom_rate ) + "px)"
    
        function_graph.innerHTML = ""
        function_explanation.innerHTML = ""
        function_graph.appendChild(axisNode)
        function_explanation.appendChild(discriptionNode)
        function_modal.style.visibility = "visible"
        function_modal.style.opacity = "1"
        blur_background.style.visibility = "visible"
        blur_background.style.opacity = "1"
        MathJax.typeset()
    })
}

function setup_chart(image_url, functions) {
    chart_triggered = false
    document.querySelectorAll(".function-preview").forEach(el => el.remove())

    chart_element.style.background = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${image_url}') no-repeat center`
    chart_element.style.backgroundSize = "100% 100%"

    evaluated_functions = []
    functions.forEach((f, i) => {
        f.index = i
        f.id = String.fromCharCode(97 + i)
        let evaluated_data = []
        num_range(...f.domain).forEach(num => evaluated_data.push({x: num, y: f.evaluate(num)}))
        evaluated_functions.push({name: 'series-' + f.id, data: evaluated_data})
    })

    series_tension = {}
    functions.forEach(f => {
        series_tension['series-' + f.id] = {lineSmooth: Chartist.Interpolation.cardinal({tension: f.tension})}
    })

    chart = new Chartist.Line('.ct-chart', {series: evaluated_functions},
        {            
            axisX: {
                type: Chartist.FixedScaleAxis,
                divisor: 10,
                low: -50,
                high: 50
            },

            axisY: {
                type: Chartist.FixedScaleAxis,
                divisor: 20,
                low: -50,
                high: 50
            },

            showPoint: false,
            fullWidth: true,
            chartPadding: {
                right: 50,
                top: 50
            },
            series: series_tension
        }
    )


    chart.on("created", (e) => {
        if (chart_triggered) return 0

        functions.forEach(f => {add_function_preview(f)})

        document.getElementById("filter-all").click()

        MathJax.typeset()
        
        chart_triggered = true
    })
}

document.querySelectorAll(".function-filter-menu div").forEach(el => {
    el.addEventListener("click", e => {
        selected_filter = e.currentTarget.innerText.replace(" ", "").toLowerCase()

        is_any_function_available = false
        document.querySelectorAll(".functions-list > .function-preview").forEach(node => {
            if (selected_filter == "all" || node.getAttribute("f-type").toLocaleLowerCase() == selected_filter) {
                node.style.display = "flex"
                is_any_function_available = true
            } else {
                node.style.display = "none"
            }
        })

        if (is_any_function_available) {
            document.querySelector(".functions-list").style.display = "grid"
            document.getElementById("unavailable-text").style.display = "none"
        } else {
            document.querySelector(".functions-list").style.display = "block"
            document.getElementById("unavailable-text").style.display = "flex"
            document.getElementById("unavailable-text").style.height = (document.querySelector(".functions-wrapper").offsetHeight - 15) + "px"
        }

        document.querySelector(".active-filter").classList.remove("active-filter")
        e.currentTarget.classList.add("active-filter")
    })
})

document.querySelector(".arrow.right").addEventListener("click", e => {
    current_chart = (current_chart + 1) % available_charts.length
    document.querySelector(".arrow.left").style.display = (current_chart > 0) ? "inline-block" : "none"
    document.querySelector(".arrow.right").style.display = (current_chart == available_charts.length - 1) ? "none" : "inline-block"
    setup_chart(available_charts[current_chart].image, available_charts[current_chart].functions)
})

document.querySelector(".arrow.left").addEventListener("click", e => {
    current_chart = (current_chart - 1) % available_charts.length
    document.querySelector(".arrow.left").style.display = (current_chart > 0) ? "inline-block" : "none"
    document.querySelector(".arrow.right").style.display = (current_chart == available_charts.length - 1) ? "none" : "inline-block"
    setup_chart(available_charts[current_chart].image, available_charts[current_chart].functions)
})

var current_chart = 0
setup_chart(available_charts[current_chart].image, available_charts[current_chart].functions)

function closeParent(e) { 
    e.currentTarget.parentElement.style.opacity = "0"
    e.currentTarget.parentElement.style.visibility = "hidden"
    document.querySelector(".instructions").style.display = "none"
    blackBackground = document.querySelector(".blur-background")
    blackBackground.style.opacity = "0"
    blackBackground.style.visibility = "hidden"
}

// function maintain_chart_size() {
//     console.log(window.innerWidth / document.getElementById("chartContainer").offsetWidth)
//     chart_element.transform = "scale(2)"
// }
// window.addEventListener('resize', maintain_chart_size)
// maintain_chart_size()