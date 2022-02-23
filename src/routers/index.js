const {
  express
} = require('../config/config');
const router = express();
const RoomsData = require('../config/data/roomsData');
const roomsData = new RoomsData();
const RoomsPlayingData = require('../config/data/roomsPlayingData');
const roomsPlayingData = new RoomsPlayingData();
const jwtFunction = require('../config/lib/jwtFunction');

const { nanoid } = require('nanoid');

router.post('/api/users/auth', async(req, res, next) => {
  try {
    const { username } = req.body;
    const uuid = nanoid(10);

    const jwtToken = await jwtFunction.signJwtToken(username, uuid);

    res.status(200).json({
      data: {
        accessToken: jwtToken
      }
    })
  } catch(err) {
    res.status(400).json({ message: err.message });
  }
})

router.get('/api/rooms/:roomUuid/capacity', (req, res, next) => {
  try {
    const { roomUuid } = req.params;

    if(!roomsData.getRoom(roomUuid)) {
      throw new Error('room did not found');
    }

    if(roomsData.getRoom(roomUuid).players.length >= 2) {
      throw new Error('room is full');
    }

    res.status(200).json({ data: roomsData.getRoom(roomUuid) });
  } catch(err) {
    res.status(400).json({ message: err.message });
  }
})

router.get('/api/rooms/:roomUuid', (req, res, next) => {
  try {
    const { roomUuid } = req.params;

    if(!roomsData.getRoom(roomUuid)) {
      throw new Error('room did not found');
    }

    res.status(200).json({ data: roomsData.getRoom(roomUuid) });
  } catch(err) {
    res.status(400).json({ message: err.message });
  }
})

router.get('/api/rooms', (req, res, next) => {
  try {
    const roomsArray = roomsData.getAllRooms();

    res.status(200).json({ data: { roomsArray } })
  } catch(err) {
    res.status(400).json({ message: err.message });
  }
})

router.get('/api/room/:roomUuid/playing', (req, res, next) => {
  try {
    const { roomUuid } = req.params;

    if(!roomsPlayingObject[roomUuid]) throw new Error('room did not found');

    res.status(200).json({ data: { roomPlayingData: roomsPlayingObject[roomUuid] } })
  } catch(err) {
    res.status(400).json({ message: err.message });
  }
})

module.exports = router;