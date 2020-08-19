

problems encountered:
unresponsive bg-image - solved by adding height to element
longer body width caused by .row class of bootstrap - solved by putting .row within a .container <div>

banking.html link not loading when clicked from index page, changed the link address thus <a href="/views/banking.html" class="nav-link link">banking</a> to <a href="views/banking.html" class="nav-link link">banking</a></li>, bug originator: cobi          



//===================================================================================================================================//
                            title: using access control
you will have to empty your database nd create new users because old users and admins will not conform to the new user schema.
to create an admin edit role parameter in signup route of app.js to admin start server and signup, change to user for subsequent user accounts creation. /admin will take you to admin route if logged in as admin.

//=====================================================================================================================================//
//===========================================================================================================================// New folder structure
moved pages to their corresponding folder i.e banking, individual banking etc into one folder named-banking...
adjustment of routes required...
//==============================================================================================//