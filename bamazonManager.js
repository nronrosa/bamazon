var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');
var tableData;
var price;

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
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Quit"],
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

                case "Quit":
                    connection.end();
                    break;
            };
        });
};

function productsForSale() {
    console.log("\r\n|--------------------Bamazon Products--------------------|")
    connection.query("SELECT item_id, product_name, department_name, price, stock_quantity FROM products", function (err, response) {
        tableData = new Table({
            head: ["Id", "Product Name", "Dept Name", "Price", "Qty"],
            colWidths: [6, 65, 20, 10, 6]
        });

        for (var i = 0; i < response.length; i++) {
            price = numberCurrency(response[i].price, "$");
            // .toString();
            // if (price.indexOf(".") === -1) {
            //     price += ".00";
            // }
            tableData.push([response[i].item_id, response[i].product_name, response[i].department_name, price, response[i].stock_quantity]);
        };
        console.log(tableData.toString());
        managerReports();
    });
};


function lowInventory() {
    console.log("\r\n|--------------------Bamazon LOW Inventory (less than 5)--------------------|")
    connection.query("SELECT item_id, product_name, department_name, price, stock_quantity FROM products WHERE stock_quantity < 5", function (err, response) {
        tableData = new Table({
            head: ["Id", "Product Name", "Dept Name", "Price", "Qty"],
            colWidths: [6, 65, 20, 10, 6]
        });

        for (var i = 0; i < response.length; i++) {
            price = numberCurrency(response[i].price, "$");
            // price = response[i].price.toString();
            // if (price.indexOf(".") === -1) {
            //     price += ".00";
            // }
            tableData.push([response[i].item_id, response[i].product_name, response[i].department_name, price, response[i].stock_quantity]);
        };
        console.log(tableData.toString());
        managerReports();

    });
};


function addInventory() {
    console.log("\r\n|--------------------Bamazon ADD Inventory--------------------|")
    inquirer
        .prompt([{
                name: "addToItemId",
                type: "input",
                message: "Which ID do you want to add more inventory?",
                validate: function (input) {
                    var input = parseInt(input);
                    if ((isNaN(input) === false) && !(input <= 0)) {
                        return true;
                    } else {
                        console.log(" <--Please enter a valid number.");
                    }
                }
            },
            {
                name: "howMany",
                type: "input",
                message: "How much more inventory do you want to add?",
                validate: function (input) {
                    var input = parseInt(input);
                    if ((isNaN(input) === false) && !(input <= 0)) {
                        return true;
                    } else {
                        console.log(" <--Please enter a valid number.");
                    }
                }
            }
        ])
        .then(function (answer) {
            connection.query("SELECT item_id, product_name, department_name, price, stock_quantity FROM products WHERE ?", {
                item_id: answer.addToItemId
            }, function (err, response) {
                if (err) throw err;
                connection.query("UPDATE products SET stock_quantity = stock_quantity + ? WHERE item_id = ?", [answer.howMany, response[0].item_id],
                    function (error) {
                        if (error) throw err;
                        var newStockQty = response[0].stock_quantity + parseInt(answer.howMany);
                        console.log("\r\n|--------------------New Inventory Added--------------------|");
                        console.log("Item ID: " + response[0].item_id);
                        console.log("Product Name: " + response[0].product_name);
                        console.log("Added " + answer.howMany + " to inventory for a new total of " + newStockQty);
                    }
                );

                connection.query("SELECT item_id, product_name, department_name, price, stock_quantity FROM products WHERE ?", {
                    item_id: answer.addToItemId
                }, function (err, response) {
                    tableData = new Table({
                        head: ["Id", "Product Name", "Dept Name", "Price", "Qty"],
                        colWidths: [6, 65, 20, 10, 6]
                    });

                    for (var i = 0; i < response.length; i++) {
                        price = numberCurrency(response[i].price, "$");
                        // price = response[i].price.toString();
                        // if (price.indexOf(".") === -1) {
                        //     price += ".00";
                        // }
                        tableData.push([response[i].item_id, response[i].product_name, response[i].department_name, price, response[i].stock_quantity]);
                    }
                    console.log(tableData.toString());
                    managerReports();
                });
            });
        });
};


function addProduct() {
    console.log("\r\n|--------------------Bamazon ADD NEW PRODUCT--------------------|")
    inquirer
        .prompt([{
                name: "deptName",
                type: "list",
                choices: ["Baby", "Books", "Clothing", "Electronics", "Kitchen", "Movies", "Music", "Office", "Pet", "Shoes", "Toys and Games"],
                message: "Choose the department name",
            },
            {
                name: "newProductName",
                type: "input",
                message: "What is the new product name?",
            },
            {
                name: "price",
                type: "input",
                message: "What is the unit price?",
                validate: function (input) {
                    var input = parseInt(input);
                    if ((isNaN(input) === false) && !(input <= 0)) {
                        return true;
                    } else {
                        console.log(" <--Please enter a valid number.");
                    }
                }
            },
            {
                name: "stock",
                type: "input",
                message: "How much initial stock quantity?",
                validate: function (input) {
                    var input = parseInt(input);
                    if ((isNaN(input) === false) && !(input <= 0)) {
                        return true;
                    } else {
                        console.log(" <--Please enter a valid number.");
                    }
                }
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
                    console.log("\r\n|--------------------New PRODUCT Added--------------------|");

                    tableData = new Table({
                        head: ["Id", "Product Name", "Dept Name", "Price", "Qty"],
                        colWidths: [6, 65, 20, 10, 6]
                    });
                    price = numberCurrency(parseFloat(answer.price), "$");
                   
                    tableData.push(["X", answer.newProductName, answer.deptName, price, parseInt(answer.stock)]);
                    console.log(tableData.toString());
                    managerReports();
                }
            );
        });
};


function numberCurrency(n, currency) {
    return currency + n.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
  };