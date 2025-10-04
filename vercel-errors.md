Please deeply analyze our schema in our database or collections regarding users and customer users table and their relationship as well in our apps/cms.

Pay attention that it uses enterprise-grade type of design such that it separates schema for customers from users table but they are well-connected.

You can also deeply search about database schema design from enterprise grade platform such as ubereats and foodpanda. You can also review the enterprise-database-architecture.md . Please only do the research, never modify anything.

I have a follow up question later.








Deeply analyze our header in apps/web, do you see there is google maps interaction where we can search and choose address right?

Please don't modify my code base for now, we are yet discussing plan of choice for our goal this time.

Now

Here is my goal, goal:

I want to create a schema for storing such addresses.

However, for a multivendor food delivery platform like Ubereats or FoodPanda, it is not only the customers that need to have addresses in the record. Vendors, Drivers, Admins also need to have addresses so we can compare and calculate their distances for location-based food rendering.

It is very important that we need to have consistent address formatting for all users: Customers; Drivers; Admins

Here are choices, choose the best enterprise-level schema edsign that is common in big platforms like ubereats or foodpanda:

1. Define addresses inside the users table

2. Define addresses inside each of user type table, such as customers, drivers, merchants

3. Create a dedicated addresses table standalone and connect to all users

Please choose one.