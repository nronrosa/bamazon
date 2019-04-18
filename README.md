# bamazon

### Overview of Project
This is an Amazon-like storefront and has three options to view and interact with the app:

####Customer View
Takes in orders from customers and deplete stock from the store's inventory. Prompts customers with messages.
   * The first should ask them the ID of the product they would like to buy.
   * The second message should ask how many units of the product they would like to buy and checks if there is sufficient quantity to fulfill order.
   * Also calculates purchase total.
   * And asks if would like to continue or quit.

####Manager View
List of menu options:
   * View Products for Sale: the app lists every available item to purchase
   * View Low Inventory: list all items with an inventory count lower than five.
   * Add to Inventory: displays a prompt that will let the manager "add more" of any item currently in the store.
   * Add New Product: allows the manager to add a completely new product to the store.

####Supervisor View
List of menu options:
   * View Product Sales by Department: displays a summarized table that has the calculated over head costs and total profits per department. (Uses join and aliases)
   * Create New Department: displays a prompt that will let the supervisor "add a new dept".

### What this project uses
This project uses Nodejs, JavaScript, MySQL Workbench, functions, NPM: inquirer, cli-table, mySQL

### How it functions
From terminal you will use a command and either select from the options displayed or prompts based on either Customer, Manager or Supervisor views.

Type in the command line 'node' and one of the following commands:
#### Customer View: node bamazonCustomer.js
![Customer View](/images/customerView.png) 

#### Manager View: node bamazonManager.js
![Manager View](/images/managerView.png) 

#### Supervisor View: node bamazonManager.js
![Supervisor View](/images/supervisorView.png) 

#### Validation
![validation](/images/validation.png) 
