var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');
var tableData;

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "trilogy2",
    password: "password123",
    database: "bamazon_db"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("BAMAZON Supervisor Reports (" + connection.threadId + ")");
    console.log("**-**-**-**-**-**-**-**-**-**-**-**-**-**-**-**-**-**-**-**-**-**-**-**-**-**-**-**-**")
    supervisorReports();
});

function supervisorReports() {
    inquirer
        .prompt({
            name: "reports",
            type: "list",
            choices: ["View Product Sales by Department", "Create New Department", "Quit"],
            message: "What do you want to do?",
        })
        .then(function (answer) {
            switch (answer.reports) {
                case "View Product Sales by Department":
                    productSalesByDept();
                    break;

                case "Create New Department":
                    createNewDept();
                    break;

                case "Quit":
                    connection.end();
                    break;
            };
        });
};

function productSalesByDept() {
    console.log("\r\n|--------------------Bamazon Products Sales by Department--------------------|")
    var querySQL = "SELECT d.department_id,d.department_name, d.over_head_costs, SUM(IFNULL(p.product_sales, 0)) as product_sales FROM departments as d LEFT JOIN products as p ON d.department_name = p.department_name GROUP BY department_id, department_name, over_head_costs ORDER BY department_id;"
    connection.query(querySQL, function (err, response) {

        tableData = new Table({
            head: ["Dept_Id", "Department Name", "Over Head Costs", "Product Sales", "Total Profits"],
            colWidths: [10, 25, 20, 20, 25]
        });

        for (var i = 0; i < response.length; i++) {
            var prodSales = response[i].product_sales
            var totalProfits = response[i].over_head_costs - prodSales;
            var overHeadCosts = numberCurrency(response[i].over_head_costs, "$");
            prodSales = numberCurrency(prodSales, "$");
            totalProfits = numberCurrency(totalProfits, "$");

            tableData.push([response[i].department_id, response[i].department_name, overHeadCosts, prodSales, totalProfits]);
        };
        console.log(tableData.toString());
        supervisorReports();
    });
};

function createNewDept() {
    console.log("\r\n|--------------------Bamazon ADD NEW DEPARTMENT--------------------|")
    inquirer
        .prompt([{
                name: "deptName",
                type: "input",
                message: "What is the new department name?",
            },
            {
                name: "overHead",
                type: "input",
                message: "What is the over head costs for the department?",
                validate: function (input) {
                    var input = parseInt(input);
                    if ((isNaN(input) === false) && !(input <= 0)) {
                        return true;
                    } else {
                        console.log(" <--Please enter a valid number.");
                    }
                }
            },
        ])
        .then(function (answer) {
            connection.query(
                "INSERT INTO departments SET ?", {
                    department_name: answer.deptName,
                    over_head_costs: answer.overHead,
                },
                function (err) {
                    if (err) throw err;
                    console.log("\r\n|--------------------New Department Added--------------------|");

                    tableData = new Table({
                        head: ["Dept Id", "Department Name", "Dept Name"],
                        colWidths: [10, 65, 20]
                    });

                    tableData.push(["X", answer.deptName, answer.overHead]);
                    console.log(tableData.toString());
                    supervisorReports();
                }
            );

        });

};

function numberCurrency(n, currency) {
    return currency + n.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
};