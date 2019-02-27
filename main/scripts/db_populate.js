import fetch from 'node-fetch'
import moment from 'moment'

const usersSeedData = [
  {
    name: 'Ines',
    password: 'pass'
  },
  {
    name: 'Ingrid',
    password: 'pass'
  },
  {
    name: 'Carl',
    password: 'pass'
  },
  {
    name: 'August',
    password: 'pass'
  }
]

// Starts from MONDAY
const ineshSlots = Array.from({ length: 7 }, (v, i) => {
  return {
    creator_role: 'INTERVIEWER',
    from: moment({
      hour: 9,
      minute: 0,
      second: 0,
      millisecond: 0
    })
      .day(i + 8)
      .toISOString(),
    to: moment({
      hour: 16,
      minute: 0,
      second: 0,
      millisecond: 0
    })
      .day(i + 8)
      .toISOString()
  }
})

// Starts from MONDAY
const ingridSlots = [
  {
    creator_role: 'INTERVIEWER',
    from: moment({
      hour: 12,
      minute: 0,
      second: 0,
      millisecond: 0
    })
      .day(8)
      .toISOString(),
    to: moment({
      hour: 18,
      minute: 0,
      second: 0,
      millisecond: 0
    })
      .day(8)
      .toISOString()
  },
  {
    creator_role: 'INTERVIEWER',
    from: moment({
      hour: 12,
      minute: 0,
      second: 0,
      millisecond: 0
    })
      .day(10)
      .toISOString(),
    to: moment({
      hour: 18,
      minute: 0,
      second: 0,
      millisecond: 0
    })
      .day(10)
      .toISOString()
  }
]

const carlSlots = [
  // Starts from MONDAY
  {
    creator_role: 'CANDIDATE',
    from: moment({
      hour: 9,
      minute: 0,
      second: 0,
      millisecond: 0
    })
      .day(8)
      .toISOString(),
    to: moment({
      hour: 10,
      minute: 0,
      second: 0,
      millisecond: 0
    })
      .day(8)
      .toISOString()
  },
  // THUSDAY
  {
    creator_role: 'CANDIDATE',
    from: moment({
      hour: 9,
      minute: 0,
      second: 0,
      millisecond: 0
    })
      .day(9)
      .toISOString(),
    to: moment({
      hour: 10,
      minute: 0,
      second: 0,
      millisecond: 0
    })
      .day(9)
      .toISOString()
  },
  // WEDNSDAY
  {
    creator_role: 'CANDIDATE',
    from: moment({
      hour: 10,
      minute: 0,
      second: 0,
      millisecond: 0
    })
      .day(10)
      .toISOString(),
    to: moment({
      hour: 13,
      minute: 0,
      second: 0,
      millisecond: 0
    })
      .day(10)
      .toISOString()
  },
  // THURSDAY
  {
    creator_role: 'CANDIDATE',
    from: moment({
      hour: 9,
      minute: 0,
      second: 0,
      millisecond: 0
    })
      .day(11)
      .toISOString(),
    to: moment({
      hour: 10,
      minute: 0,
      second: 0,
      millisecond: 0
    })
      .day(11)
      .toISOString()
  },
  // FRIDAY
  {
    creator_role: 'CANDIDATE',
    from: moment({
      hour: 9,
      minute: 0,
      second: 0,
      millisecond: 0
    })
      .day(12)
      .toISOString(),
    to: moment({
      hour: 10,
      minute: 0,
      second: 0,
      millisecond: 0
    })
      .day(12)
      .toISOString()
  }
]

const augustSlots = [
  {
    creator_role: 'CANDIDATE',
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
  }
]

async function simulate() {
  /* CREATE USERS */
  try {
    const createdUsersResponses = []
    for (const data of usersSeedData) {
      createdUsersResponses.push(
        await fetch('http://localhost:3030/auth/register', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
      )
    }

    const [ines, ingrid, carl, august] = await Promise.all(
      createdUsersResponses.map(result => result.json())
    )
    // /* Ines creates a slot */
    const inesSlotsPesponses = await Promise.all(
      ineshSlots.map(slot =>
        fetch('http://localhost:3030/slots', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${ines.token}`
          },
          body: JSON.stringify(slot)
        })
      )
    )

    /* Igrid creates a lot */
    const ingridSlotsPesponses = await Promise.all(
      ingridSlots.map(slot =>
        fetch('http://localhost:3030/slots', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${ingrid.token}`
          },
          body: JSON.stringify(slot)
        })
      )
    )

    /* Carl creates a slot */
    const carlSlotsPesponses = await Promise.all(
      carlSlots.map(slot =>
        fetch('http://localhost:3030/slots', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${carl.token}`
          },
          body: JSON.stringify(slot)
        })
      )
    )

    const augustSlotsPesponses = await Promise.all(
      augustSlots.map(slot =>
        fetch('http://localhost:3030/slots', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${august.token}`
          },
          body: JSON.stringify(slot)
        })
      )
    )

    console.log(
      'carlSlotsPesponses',
      await Promise.all(inesSlotsPesponses.map(res => res.json()))
    )

    console.log('')
  } catch (err) {
    console.log(err)
  }
}

simulate().then()
