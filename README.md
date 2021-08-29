# shede

#### Video Demo: https://youtu.be/JcoinGFtqYI

#### Description:

shede is a e-commerce website that provides a platform for citizens of my local area to
sell and purchase second hand goods at an affordable value. The web app is built with
Typescript React for the front-end, Node.js for the back-end, and Postgres for the database.
The back-end is connnected to the front-end with Express.js.

shede has an account system where users can register and log in. Their password is protected
by using bcrypt's hash function with salt rounds. The authentication of the user involves a
JSON Web Token that is stored inside of the local storage.
