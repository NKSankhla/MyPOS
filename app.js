document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("root");
  
    let menu = [
      { id: 1, name: "Samosa", price: 20, unitType: "qty" },
      { id: 2, name: "Kachori", price: 20, unitType: "qty" },
      { id: 3, name: "Shahi Samosa", price: 25, unitType: "qty" },
      { id: 4, name: "Dahi Bada", price: 30, unitType: "qty" },
    ];
    const cart = [];
    const invoices = [];
  
    let currentPage = "billing"; // Default page
  
    function render() {
      root.innerHTML = `
        ${renderNavBar()}
        <div class="container">
          ${currentPage === "billing" ? renderBillingPage() : ""}
          ${currentPage === "invoices" ? renderInvoicesPage() : ""}
          ${currentPage === "updateMenu" ? renderUpdateMenuPage() : ""}
        </div>
      `;
      attachEventListeners();
    }
  
    function renderNavBar() {
      return `
        <div class="navbar">
          <a data-page="billing">Billing</a>
          <a data-page="invoices">View Invoices</a>
          <a data-page="updateMenu">Update Menu</a>
        </div>
      `;
    }
  
    function renderBillingPage() {
      return `
        <div class="menu">
          <h2>Menu</h2>
          <ul>
            ${menu
              .map((item) => {
                const itemInCart = cart.find((cartItem) => cartItem.id === item.id);
                return `
                  <li>
                    <span>${item.name} - ₹${item.price}${item.unitType === "weight" ? "/kg" : ""}</span>
                    ${
                      itemInCart
                        ? renderControls(item, itemInCart.qty)
                        : `<button class="add-to-cart" data-id="${item.id}">Add to Cart</button>`
                    }
                  </li>
                `;
              })
              .join("")}
          </ul>
        </div>
        <div class="cart">
          <h2>Cart</h2>
          <ul>
            ${cart
              .map(
                (item) =>
                  `<li>
                    <span>${item.name} x ${item.qty} - ₹${item.qty * item.price}</span>
                    <button class="remove" data-id="${item.id}">Remove</button>
                  </li>`
              )
              .join("")}
          </ul>
          <div class="cart-total">
            <h3>Total: ₹${cart.reduce((sum, item) => sum + item.qty * item.price, 0)}</h3>
            <button class="print-btn">Print Invoice</button>
          </div>
        </div>
      `;
    }
  
    function renderControls(item, qty) {
      return `
        <div class="controls">
          <button class="decrease" data-id="${item.id}">-</button>
          <span>${qty}</span>
          <button class="increase" data-id="${item.id}">+</button>
        </div>
      `;
    }
  
    function renderInvoicesPage() {
      return `
        <div class="invoices">
          <h2>Invoices</h2>
          <ul>
            ${invoices
              .map(
                (invoice, index) =>
                  `<li>
                    <strong>Invoice #${index + 1}</strong> - Total: ₹${invoice.total}
                    <ul>
                      ${invoice.items
                        .map(
                          (item) =>
                            `<li>${item.name} x ${item.qty} - ₹${item.qty * item.price}</li>`
                        )
                        .join("")}
                    </ul>
                    <button class="reprint-btn" data-index="${index}">Print</button>
                  </li>`
              )
              .join("")}
          </ul>
        </div>
      `;
    }
  
    function renderUpdateMenuPage() {
      return `
        <div class="update-menu">
          <h2>Update Menu</h2>
          <form id="menu-form">
            <input type="text" id="item-name" placeholder="Item Name" required />
            <input type="number" id="item-price" placeholder="Price" required />
            <select id="unit-type">
              <option value="qty">Quantity</option>
              <option value="weight">Weight</option>
            </select>
            <button type="submit">Add/Update Item</button>
          </form>
          <h3>Current Menu</h3>
          <ul>
            ${menu
              .map(
                (item) =>
                  `<li>
                    ${item.name} - ₹${item.price}${item.unitType === "weight" ? "/kg" : ""}
                    <button class="edit-btn" data-id="${item.id}">Edit</button>
                  </li>`
              )
              .join("")}
          </ul>
        </div>
      `;
    }
  
    function attachEventListeners() {
      document.querySelectorAll(".navbar a").forEach((link) => {
        link.addEventListener("click", (e) => {
          currentPage = e.target.dataset.page;
          render();
        });
      });
  
      document.querySelectorAll(".add-to-cart").forEach((button) => {
        button.addEventListener("click", (e) => {
          const id = parseInt(e.target.dataset.id);
          const item = menu.find((menuItem) => menuItem.id === id);
          cart.push({ ...item, qty: 1 });
          render();
        });
      });
  
      document.querySelectorAll(".increase").forEach((button) => {
        button.addEventListener("click", (e) => {
          const id = parseInt(e.target.dataset.id);
          const itemInCart = cart.find((cartItem) => cartItem.id === id);
          itemInCart.qty += 1;
          render();
        });
      });
  
      document.querySelectorAll(".decrease").forEach((button) => {
        button.addEventListener("click", (e) => {
          const id = parseInt(e.target.dataset.id);
          const itemInCart = cart.find((cartItem) => cartItem.id === id);
          itemInCart.qty -= 1;
          if (itemInCart.qty <= 0) {
            const index = cart.indexOf(itemInCart);
            cart.splice(index, 1);
          }
          render();
        });
      });
  
      document.querySelectorAll(".remove").forEach((button) => {
        button.addEventListener("click", (e) => {
          const id = parseInt(e.target.dataset.id);
          const index = cart.findIndex((cartItem) => cartItem.id === id);
          cart.splice(index, 1);
          render();
        });
      });
  
      document.querySelector(".print-btn")?.addEventListener("click", () => {
        if (cart.length === 0) return;
  
        const newInvoice = {
          items: [...cart],
          total: cart.reduce((sum, item) => sum + item.qty * item.price, 0),
          billNo: new Date().toLocaleDateString("en-GB").replace(/\//g, "") + " " + new Date().toLocaleTimeString().replace(/:/g, "").slice(0, 4),
          date: new Date(),
        };
  
        invoices.push(newInvoice);
        printInvoice(newInvoice);
        cart.length = 0;
        render();
      });
  
      document.querySelectorAll(".reprint-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
          const index = parseInt(e.target.dataset.index);
          printInvoice(invoices[index]);
        });
      });
  
      document.querySelector("#menu-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.querySelector("#item-name").value;
        const price = parseInt(document.querySelector("#item-price").value);
        const unitType = document.querySelector("#unit-type").value;
  
        const existingItem = menu.find((item) => item.name === name);
        if (existingItem) {
          existingItem.price = price;
          existingItem.unitType = unitType;
        } else {
          menu.push({ id: menu.length + 1, name, price, unitType });
        }
        render();
      });
  
      document.querySelectorAll(".edit-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
          const id = parseInt(e.target.dataset.id);
          const item = menu.find((menuItem) => menuItem.id === id);
          document.querySelector("#item-name").value = item.name;
          document.querySelector("#item-price").value = item.price;
          document.querySelector("#unit-type").value = item.unitType;
        });
      });
    }
  
    function printInvoice(invoice) {
      const printWindow = window.open("", "", "width=600,height=400");
      printWindow.document.write("<pre style='font-family:monospace;'>");
      printWindow.document.write(`
        Invoice No: ${invoice.billNo}
        Date: ${invoice.date.toLocaleString()}
        ----------------------------
        Items:
        ${invoice.items
          .map(
            (item) => `${item.name} x ${item.qty} - ₹${item.qty * item.price}`
          )
          .join("\n")}
        ----------------------------
        Total: ₹${invoice.total}
        ----------------------------
      `);
      printWindow.document.write("</pre>");
      printWindow.print();
    }
  
    render();
  });
    
