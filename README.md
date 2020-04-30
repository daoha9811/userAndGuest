<!-- This is a static file -->
<!-- served from your routes in server.js -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Welcome to Glitch!</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="A cool thing made with Glitch">
    <link id="favicon" rel="icon" href="https://glitch.com/edit/favicon-app.ico" type="image/x-icon">

    <!-- import the webpage's stylesheet -->
    <link rel="stylesheet" href="/style.css">

    <!-- import the webpage's client-side javascript file -->
    <script src="/script.js" defer></script>
  </head>
  <body>
    <header>
      <h1>A Dream of the Future</h1>
    </header>

    <main>
      <ul>
        <%if(data) {%>
          <% console.log(data)%>
          <%for(let i of data) {%>
              <li><%- i.name %> 
                <a href="/books/<%- i.id%>/delete">xoa</a>
                <a href="/books/<%- i.id%>/update">update</a>
              </li>
            <% } %>
          <% } %>
      </ul>
      <form method="GET">
        <input type="text" name="q"/>
        <button type="submit">
          search
        </button>
      </form>
      <form action="/users/create" method="POST" style="margin-top: 30px">
        <label>name :</label>
        <br/>
        <input type="text" name="name"/>
        <br />
        <button type="submit">
          Create
        </button>
      </form>
    </main>

    <footer>Made with <a href="https://glitch.com">Glitch</a>!</footer>

    <!-- include the Glitch button to show what the webpage is about and
          to make it easier for folks to view source and remix -->
    <div class="glitchButton" style="position:fixed;top:2em;right:20px;"></div>
    <script src="https://button.glitch.me/button.js"></script>
  </body>
</html>
