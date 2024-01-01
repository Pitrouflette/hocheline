const socket = io();

const databaseContentElement = document.getElementById('db');
const onlines = document.getElementById('online-users');
const visiters = document.getElementById('total-visits');
const messages = document.getElementById('total-message');
const posts = document.getElementById('total-post');
const accounts = document.getElementById('total-account');

socket.emit("getDB", "");
socket.on("recive DB", (data) => {
  let accountCount = data.length;
  console.log(accountCount);
  accounts.innerHTML = accountCount;

  const tableHTML = generateTableHTML(data);

  databaseContentElement.innerHTML = tableHTML;
});
  

socket.emit("admin data", "");
socket.on("admin", (data) => {
    console.log(data);
    onlines.innerHTML = (data.onlines);
    visiters.innerHTML = (data.visiters - 2);
    messages.innerHTML = (data.messages);
    posts.innerHTML = (data.posts);
});


function generateTableHTML(data) {
  if (!data || data.length === 0) {
    return "<p>Aucune donnée disponible.</p>";
  }

  const tableRows = data.map((row, index) => {
    const rowStyle = index % 2 === 0 ? 'even-row' : 'odd-row';

    const rowCells = Object.values(row).map((value) => `<td>${value}</td>`).join("");
    return `<tr class="${rowStyle}">${rowCells}</tr>`;
  });

  const columnHeaders = Object.keys(data[0]);
  const tableHeader = `<tr>${columnHeaders.map((header) => `<th>${header}</th>`).join("")}</tr>`;

  const tableHTML = `<table>${tableHeader}${tableRows.join("")}</table>`;

  return tableHTML;
}
