var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "trilogy2",
    password: "password123",
    database: "bamazon_db"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("BAMAZON Manager Reports (" + connection.threadId + ")");
    console.log("*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*")
    managerReports();
});

function managerReports() {
    inquirer
        .prompt({
            name: "reports",
            type: "list",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
            message: "Which report do you want to view?",
        })
        .then(function (answer) {
            switch (answer.reports) {
                case "View Products for Sale":
                    productsForSale();
                    break;

                case "View Low Inventory":
                    lowInventory();
                    break;

                case "Add to Inventory":
                    addInventory();
                    break;

                case "Add New Product":
                    addProduct();
                    break;

                default:
                    console.log("Select a report to view.");
            };
        });
};

function productsForSale() {
    console.log("|--------------------Bamazon Products for Sale--------------------|")
    connection.query("SELECT item_id, product_name, department_name, price, stock_quantity FROM products", function (err, results) {
        var table = new Table({
            head: ["Id", "Product Name", "Dept Name", "Price", "Qty"],
            colWidths: [6, 65, 20, 10, 6]
        });

        for (var i = 0; i < results.length; i++) {
            table.push([results[i].item_id, results[i].product_name, results[i].department_name, results[i].price, results[i].stock_quantity]);
        }
        console.log(table.toString());
        managerReports();
    });
};





function lowInventory() {
    console.log("|--------------------Bamazon LOW Inventory (less than 5)--------------------|")
    connection.query("SELECT item_id, product_name, department_name, price, stock_quantity FROM products WHERE stock_quantity < 5", function (err, results) {
        var table = new Table({
            head: ["Id", "Product Name", "Dept Name", "Price", "Qty"],
            colWidths: [6, 65, 20, 10, 6]
        });

        for (var i = 0; i < results.length; i++) {
            table.push([results[i].item_id, results[i].product_name, results[i].department_name, results[i].price, results[i].stock_quantity]);
        }
        console.log(table.toString());
        managerReports();

    });
};


function addInventory() {
    console.log("|--------------------Bamazon ADD Inventory--------------------|")
    
    inquirer
        .prompt([{
                name: "addToItemId",
                type: "input",
                message: "Which ID do you want to add more inventory?",
            },
            {
                name: "howMany",
                type: "input",
                message: "How much more inventory do you want to add?",
            }
        ])
        .then(function (answer) {
            connection.query("SELECT item_id, product_name, department_name, price, stock_quantity FROM products WHERE ?", {
                item_id: answer.addToItemId
            }, function (err, results) {
                if (err) throw err;
                connection.query("UPDATE products SET stock_quantity = stock_quantity + ? WHERE item_id = ?", [answer.howMany, results[0].item_id],
                    function (error) {
                        if (error) throw err;
                        var newStockQty = results[0].stock_quantity + parseInt(answer.howMany);
                        console.log("|--------------------New Inventory Added--------------------|");
                        console.log("Item ID: " + results[0].item_id);
                        console.log("Product Name: " + results[0].product_name);
                        console.log("Added " + answer.howMany + " to inventory for a new total of " + newStockQty);
                        console.log("------------------------------------------------------------");
                    }
                );


            });

        });

};


function addProduct() {
    console.log("|--------------------Bamazon ADD NEW PRODUCT--------------------|")
    inquirer
        .prompt([{
                name: "newProductName",
                type: "input",
                message: "What is the new product name?",
            },
            {
                name: "deptName",
                type: "input",
                message: "What is the department name?",
            },
            {
                name: "price",
                type: "input",
                message: "What is the unit price?",
            },
            {
                name: "stock",
                type: "input",
                message: "How much initial stock quantity?",
            }
        ])
        .then(function (answer) {
            connection.query(
                "INSERT INTO products SET ?", {
                    product_name: answer.newProductName,
                    department_name: answer.deptName,
                    price: answer.price,
                    stock_quantity: parseInt(answer.stock)
                },
                function (err) {
                    if (err) throw err;
                    console.log("|--------------------New PRODUCT Added--------------------|");
                    managerReports();
                    productsForSale();
                }
            );

        });

};