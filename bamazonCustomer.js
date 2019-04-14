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
    console.log("WELCOME TO BAMAZON! Happy shopping! (" + connection.threadId+")");
    console.log("*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*")
    productsDisplay();
});


function productsDisplay() {
    connection.query("SELECT item_id, product_name, department_name, price, stock_quantity FROM products", function (err, response) {
        var table = new Table({
            head: ["Id", "Product Name", "Dept Name", "Price", "Qty"],
            colWidths: [6, 65, 20, 10, 6]
        });

        for (var i = 0; i < response.length; i++) {
            table.push([response[i].item_id, response[i].product_name, response[i].department_name, response[i].price, response[i].stock_quantity]);
        }
        console.log(table.toString());
        shop();
    });
};

function shop() {
    inquirer
        .prompt([{
                name: "buyItemId",
                type: "input",
                message: "What item ID would you like to purchase?",
            },
            {
                name: "quantity",
                type: "input",
                message: "How many would you like?",
            }
        ])
        .then(function (answer) {
            connection.query("SELECT item_id, product_name, department_name, price, stock_quantity FROM products WHERE ?", { item_id: answer.buyItemId }, function (err, results) {
                if (err) throw err;
                if (results[0].stock_quantity < parseInt(answer.quantity)) {
                    console.log("Insufficient supply to complete your order. There are " + results[0].stock_quantity +" item(s) left. Try again...");
                    continueToShop();
                } else {
                    console.log("You purchased '" + answer.quantity + "' of ");
                    console.log("   Item ID: " + results[0].item_id + " Product Name: " + results[0].product_name);

                    connection.query("UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?", [answer.quantity, results[0].item_id],
                        function (error) {
                            if (error) throw err;
                            var total = results[0].price * answer.quantity;
                            console.log("   Your total is: " + total);
                            console.log("Your order completed successfully! Thanks for shopping at Bamazon!");
                            continueToShop();
                        }
                    );
                
                }
            });
        });
};

function continueToShop() {
    inquirer
        .prompt({
            name: "continue",
            type: "list",
            choices: ["Continue", "Quit"],
            message: "Would you like to [CONTINUE] or [QUIT]?",
        })
        .then(function (answer) {
            if (answer.continue === "Continue") {
                console.log("--------------------Continuing to SHOP--------------------||--------------------Continuing to SHOP--------------------")
                productsDisplay();
            } else {
                connection.end();
                console.log("Thank you! Come again!");
            }
        });
};

