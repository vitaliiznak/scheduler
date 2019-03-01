# SCHEDULER API
> The API which allows finding time overlap in order to schedule an interview


## Prerequisites

You should next stuff on your machine:
- [Docker](https://www.docker.com/)
- [Node.JS](https://nodejs.org/en//)

## How to run
1. Run a docker compose with PostgreSQL instance
    ```bash
      cd ./infrastructure
      docker-compose up
    ```
 2. Run in API (It is not in docker)

    2.1 instal dependencies
    ```bash
      cd ./main
      npm install
    ```
    2.2 create database tables
    ```bash
       npm run db_initialize
    ```
    2.3 run an api
    ```bash
       npm start
    ```
    or with nodemon
    ```bash
       npm run start:dev
    ```
  The app will start on port `3030` you can change it on `.env.local`

  ## Usage example
  Please check `./scripts/simulate` file for as an example

  - to create a user

    ```javascript
        fetch("http://localhost:3030/auth/register", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
              name: "August",
              password: 'pass'
          })
        })
    ```
  - to create a time slot

    ```javascript
       fetch('http://localhost:3030/slots', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer <TOKEN HERE>` // insert token
          },
          body: JSON.stringify(
            {
              /* EITHER 'CANDIDATE' OR  'INTERVIEWER HERE' */
              creator_role: `CANDIDATE`,
              from: moment({
                hour: 20,
                minute: 0,
                second: 0,
                millisecond: 0
              })
                .day(8)
                .toISOString(),
              to: moment({
                hour: 21,
                minute: 0,
                second: 0,
                millisecond: 0
              })
                .day(8)
                .toISOString()
            })
        })
    ```

  GET REQUESTS, they do not require authorization token
    - to get all slots
    ```
     /slots
     /slots/:id
    ```

    - get all users
    ```
     /users
     /users/:id
    ```

  - to get overlaps
    ```
     /overlaps?interviewers_and=[1,2]&candidates_and=[3]
    ```
    The requst will return time slots when interviews with id 1, 2 and candidate 3 can talk ALL together (EVERYONE at the same time)


## Implementation details

In order to found time overlaps,SQL query is dynamically are generated and it is similar to this one.
I didn't manage to do a profiling, It could be optimized

```sql
SELECT  tstzrange(slots_of_creator_1.time_range * slots_of_creator_3.time_range * slots_of_creator_4.time_range) AS "time_intersection", * FROM  INNER JOIN (SELECT
          slot.id, slot.time_range, slot.creator, "user".type as creator_type
          FROM slot
          LEFT JOIN "user" ON "user".id = slot.creator
              WHERE "user".type='INTERVIEWER'
              AND creator = 1 )
              AS slots_of_creator_1 ON TRUE, INNER JOIN (SELECT
          slot.id, slot.time_range, slot.creator, "user".type as creator_type
          FROM slot
          LEFT JOIN "user" ON "user".id = slot.creator
              WHERE "user".type='INTERVIEWER'
              AND creator = 3 )
              AS slots_of_creator_3 ON TRUE, INNER JOIN (SELECT
          slot.id, slot.time_range, slot.creator, "user".type as creator_type
          FROM slot
          LEFT JOIN "user" ON "user".id = slot.creator
              WHERE "user".type='CANDIDATE'
              AND creator = 4 )
              AS slots_of_creator_4 ON TRUE

```
