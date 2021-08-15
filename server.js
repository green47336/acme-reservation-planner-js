//Grabs use of Sequelize from our node library
const Sequelize = require("sequelize");

//Deconstructs our data types from Sequelize to make our lives easier when typing later.
const { STRING, ARRAY, FLOAT } = Sequelize;

//This sets up our connection to our database. The first option is for when we'd eventually deploy our app, the second is a local path to our database that we've created.
const conn = new Sequelize(
  process.env.DATABASE_URL || "postgres://localhost/acme_db"
);

//Sync and seed is where we seed our data into our database by creating our users, restaurants, and reservations. We return users, restaurants, and reservations each as an array of reduced objects for readability. Key is their name, value is their information(?)
const syncAndSeed = async () => {
  await conn.sync({ force: true }); //This refreshes all of our data each time. This is here just because we're not looking for our data to remember changes during development.

  //Our restaurant data to be later fed into our database
  let restaurants = [
    {
      name: "Raos",
      location: [-73.932, 40.794],
    },
    {
      name: "Masa",
      location: [-73.98, 40.7685],
    },
    {
      name: "Bouley",
      location: [-74.01394, 40.705137],
    },
    {
      name: "Marc Forgione",
      location: [-74.009567, 40.716526],
    },
    {
      name: "Tamarind",
      location: [-74.008929, 40.718977],
    },
    {
      name: "Hop Lee Restaurant",
      location: [-73.998509, 40.71423],
    },
    {
      name: "Jungsik",
      location: [-74.0089, 40.718679],
    },
    {
      name: "The Capital Grille",
      location: [-74.010846, 40.708475],
    },
    {
      name: "Pylos",
      location: [-73.984152, 40.726096],
    },
    {
      name: "Joe's Shanghai",
      location: [-73.997761, 40.714601],
    },
    {
      name: "Cafe Katja",
      location: [-73.990565, 40.717719],
    },
    {
      name: "Rosanjin",
      location: [-74.007724, 40.716403],
    },
    {
      name: "Kittichai",
      location: [-74.003242, 40.724014],
    },
    {
      name: "Bianca Restaurant",
      location: [-73.992662, 40.725495],
    },
    {
      name: "Rayuela",
      location: [-73.989756, 40.721266],
    },
    {
      name: "Mas Farmhouse",
      location: [-74.003875, 40.729269],
    },
    {
      name: "Xe Lua",
      location: [-73.998626, 40.716544],
    },
  ];

  //Maps over our names and creates a restaurant in our database for each with the specified restaurant in the name property
  restaurants = await Promise.all(
    restaurants.map((restaurant) => Restaurant.create(restaurant))
  );

  //Reduces our restaurants array from simply names to an array of objects where the key is the restaurant and the value is their information
  restaurants = restaurants.reduce((acc, restaurant) => {
    acc[restaurant.name] = restaurant;
    return acc;
  }, {});

  //Maps over our names and creates a user for each with the specified name in the name property
  let users = await Promise.all(
    ["moe", "lucy", "larry"].map((name) => User.create({ name }))
  );

  //Reduces our users array from simply names to an array of objects where the key is the name and the value is their information
  users = users.reduce((acc, user) => {
    acc[user.name] = user;
    return acc;
  }, {});

  //Sets up our specific user<>restaurant reservations
  const reservations = await Promise.all([
    Reservation.create({
      userId: users.moe.id,
      restaurantId: restaurants.Tamarind.id,
    }),
    Reservation.create({
      userId: users.lucy.id,
      restaurantId: restaurants.Tamarind.id,
    }),
    Reservation.create({
      userId: users.lucy.id,
      restaurantId: restaurants.Rayuela.id,
    }),
  ]);
  //Pops out our super cool arrays of objects
  return {
    users,
    restaurants,
    reservations,
  };
}; //END OF syncAndSeed

//We set up our User model to have a name property with a type of string
const User = conn.define("user", {
  name: {
    type: STRING,
  },
});

//We set up our Reservation model with no extra properties as it will have these assigned later with foreign keys to user and restaurant primary keys
const Reservation = conn.define("reservation", {});

//We set up our Restaurant model with a name and location property with the respective values of string and array(float). The location will default to an empty array
const Restaurant = conn.define("restaurant", {
  name: {
    type: STRING,
  },
  location: {
    type: ARRAY(FLOAT),
    defaultValue: [],
  },
});

//This relationship allows a user to have many reservations at different restaurants, and a restaurant to have many users with reservations to it
Reservation.belongsTo(User); //A reservations belongs to one user
Reservation.belongsTo(Restaurant); //A reservations also belongs to one restaurant

//Setting up our node library goodies
const express = require("express");
const app = express();
const chalk = require("chalk"); //Pretty colors in our terminal
const path = require("path"); //The path modules will help us make some path that would otherwise come out like /something//..somethingElse// to simply /something/somethingElse

//This will JSON.stringify our stuff but I'm not sure if just all our app.use stuff will be stringified from here on or if we have to actually use it later with send.json or something
app.use(express.json());

//Sets up our static path to our local dist folder which has some webpack stuff in it (main.js)
app.use("/dist", express.static(path.join(__dirname, "dist")));

//Redirects to our index.html as our home page
app.get("/", (req, res, next) =>
  res.sendFile(path.join(__dirname, "index.html"))
);

//Finds all users in our db
app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await User.findAll());
  } catch (ex) {
    next(ex);
  }
});

//Finds all restaurants in our db
app.get("/api/restaurants", async (req, res, next) => {
  try {
    res.send(await Restaurant.findAll());
  } catch (ex) {
    next(ex);
  }
});

//Finds all reservations for a user specified in the request
app.get("/api/users/:userId/reservations", async (req, res, next) => {
  try {
    res.send(
      await Reservation.findAll({ where: { userId: req.params.userId } })
    );
  } catch (ex) {
    next(ex);
  }
});

//Creates a reservation for the user whose id is specified in the request with the restaurant specified in the request's body
app.post("/api/users/:userId/reservations", async (req, res, next) => {
  try {
    res.status(201).send(
      await Reservation.create({
        userId: req.params.userId,
        restaurantId: req.body.restaurantId,
      })
    );
  } catch (ex) {
    next(ex);
  }
});

//Deletes a specified reservation based on the id in the request
app.delete("/api/reservations/:id", async (req, res, next) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);
    await reservation.destroy();
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});

//Displays error if a request comes in that isn't caught by above routes?
app.use((err, req, res, next) => {
  console.log(chalk.red(err.stack));
  res.status(500).send({ error: err.message });
});
const port = process.env.PORT || 3000; //Sets that port number (deployed stuff or local 3000)

//Actually gets our server a goin' and invokes syncAndSeed
const init = async () => {
  await syncAndSeed();
  app.listen(port, () => console.log(`listening on port ${port}`));
};

//Smash that init button and don't forget to subscribe B)
init();
