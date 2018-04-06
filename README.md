# RGB-Light-Controller

Det her projekt har jeg lavet til at styre 2 led strips.
Det virker ved at NodeJS serveren hoster en hjemmeside hvorpå man kan tænde og slukke, samt ændre farve på de 2 lys.
Web serveren sender updates til klienten ved at bruge et plugin som hedder Socket.io som den bruger til at opdatere knapperne live udfra om lyset er slukket eller tændt.
Web serveren snakker med lysene ved at sende mqtt beskeder til en arduino som er koblet direkte til lysene som styrer antal volt Rgb strippen skal have.
