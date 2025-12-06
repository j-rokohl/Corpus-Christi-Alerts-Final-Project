    const largeMenu = `
                <!-- Navbar for bigger screens -->
                <a href="/" class="brand-logo orange-text text-darken-2" aria-label="Alerts Corpus Christi Home">
                    <img class="hide-on-small-and-down" src="../img/alerts-corpus-christi.svg" style="height: 63px;">
                    <img class="hide-on-med-and-up" src="../img/alerts-corpus-christi.svg" style="height: 50px;">
                </a>
                <!-- Hamburger Menu for medium and smaller screens -->
                <a href="#" class="sidenav-trigger right hide-on-large-and-up black-text" data-target="mobile-menu">
                    <i class="material-icons">menu</i>
                </a>
                <!-- Hamburger Menu for Large Screens -->
                <ul class="right hide-on-med-and-down" style="font-weight: 600;">
                    <li>
                        <a href="../index.html" class="waves-effect grey-text text-darken-4">Home</a>
                    </li>
                    <li>
                        <a href="./about.html" class="waves-effect grey-text text-darken-4">About</a>
                    </li>
                    <li>
                        <a href="./alerts.html" class="waves-effect grey-text text-darken-4">Alerts</a>
                    </li>
                    <li>
                        <a href="./forecasts.html" class="waves-effect grey-text text-darken-4">Forecasts</a>
                    </li>
                    <li>
                        <a href="./lake-levels.html" class="waves-effect grey-text text-darken-4">Lake Levels</a>
                    </li>
                    <li>
                        <a href="./notes.html" class="waves-effect grey-text text-darken-4">Notes</a>
                    </li>
                    <li>
                        <a href="./contact.html" class="waves-effect grey-text text-darken-4">Contact</a>
                    </li>
                    <li>
                        <a href="./auth.html" id="login-btn" class="waves-effect deep-orange-text text-darken-4">Login</a>
                    </li>
                    <li>
                        <a href="#" id="logout-btn" class="waves-effect deep-orange-text text-darken-4" style="display: none">Logout</a>
                    </li>
                </ul>
    `;
    document.getElementById("largeM").innerHTML = largeMenu;

        const mobileMenu = `
        <ul class="sidenav mobile-menu" id="mobile-menu">
            <li><a class="subheader">Alerts Corpus Christi</a></li>
            <li>
                <a href="../index.html" class="waves-effect grey-text text-darken-4">Home</a>
            </li>
            <li>
                <a href="./about.html" class="waves-effect grey-text text-darken-4">About</a>
            </li>
            <li>
                <a href="./alerts.html" class="waves-effect grey-text text-darken-4">Alerts</a>
            </li>
            <li>
                <a href="./forecasts.html" class="waves-effect grey-text text-darken-4">Forecasts</a>
            </li>
            <li>
                <a href="./lake-levels.html" class="waves-effect grey-text text-darken-4">Lake Levels</a>
            </li>
            <li>
                <a href="./notes.html" class="waves-effect grey-text text-darken-4">Notes</a>
            </li>
            <li>
                <a href="./contact.html" class="waves-effect grey-text text-darken-4">Contact</a>
            </li>
            <li>
                <a href="./auth.html" id="login-btn-mb" class="waves-effect deep-orange-text text-darken-4">Login</a>
            </li>
            <li>
                <a href="#" id="logout-btn-mb" class="waves-effect deep-orange-text text-darken-4" style="display: none">Logout</a>
            </li>
        </ul>
    `;
    document.getElementById("mobileM").innerHTML = mobileMenu;