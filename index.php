<?php
include_once "./include/autoloader.php";

$session = new Session();
$db = new MySQL();


$auth   = Validate::filterRequest("auth", 'string', 'login');
$lobbyID  = Validate::filterRequest("lobbyID", "string", '');


$id = 0;
$name = '';
$alert = $session->getSessionValue('alert') ?? '';

if($session->isUserLoged()) {
  $id = $session->getUserID();
  $name = $session->getSessionValue('name');
}

echo '<script>';
if(!empty($alert)) {

  echo 'const ALERT = "'.$alert.'"';
  if($session->getSessionValue('alert') != null) {
    $session->unsetSessionValue('alert');
  }
}
else {
  echo 'const ALERT = null';
}
echo '</script>';
?>

<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"> 
    <title><?php echo Config::TITLE?></title>
    <link rel="icon" type="image/x-icon" href="./favicon/favicon.ico">

    <link rel="stylesheet" href="./styles/variable.css">
    <link rel="stylesheet" href="./styles/style.css">
    <link rel="stylesheet" href="./styles/lobby.css">
    <link rel="stylesheet" href="./styles/cards.css">
    <script src="https://kit.fontawesome.com/515d599e21.js" crossorigin="anonymous"></script>
    <script defer src="./scripts/howler.js"></script>
    <script defer src="./scripts/jquery-3.7.1.js"></script>
    <script defer src="https://code.jquery.com/ui/1.13.2/jquery-ui.min.js"></script>
    <script defer src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui-touch-punch/0.2.3/jquery.ui.touch-punch.min.js"></script>
    <script src="https://cdn.socket.io/4.8.1/socket.io.min.js" integrity="sha384-mkQ3/7FUtcGyoppY6bz/PORYoGqOl7/aSUMn2ymDOJcapfS6PHqxhRTMh1RR0Q6+" crossorigin="anonymous"></script>
    <link rel="manifest" href="./manifest.webmanifest">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="mobile-web-app-capable" content="yes">
  </head>
  <body>
    <?php
    if(!$session->isUserLoged()) { ?> 
      <div id="login-area">
        <form action="./include/validateForm.php" method="post">
           <input type="text" name ="name" id="name" placeholder="Benutzername" required maxlength="20" autocomplete="off">
           <input type="submit" value="weiter" name="action" id="action">
        </form>
      </div>
      <?php
    }
    else {
      include_once "client-connecting.php";
    }
    
    ?>


<div id="game" style="display: none;">

</div>

 


<script defer>
  const ROOT = '<?php echo Config::ROOT?>'
  if("serviceWorker" in navigator) {
    navigator.serviceWorker.register(`/${ROOT}/sw.js`, { scope:` /${ROOT}/` })
    .then(function(registration) {
      console.log("ServiceWorker registration successful with scope: ", registration.scope);
    })
    .catch(function(err) {
      console.log("ServiceWorker registration failed: ", err);
    });
  }
  const installBtn = document.getElementById('installBtn');

  const isInStandaloneMode = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  if (!isInStandaloneMode()) {
    // Show install button only if not already installed
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      installBtn.parentElement.style.display = 'flex';

      installBtn.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          deferredPrompt = null;
        });
      });
    });
  }
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    installBtn.parentElement.style.display = 'none'; // Hide the button
  });

  </script>
  </body>
</html>
