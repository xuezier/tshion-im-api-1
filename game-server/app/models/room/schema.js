module.exports = {
  roomid: { type: 'string' },
  members: { type: 'object' },
  cid: { type: 'string|number' },
  room: { type: 'object' },
  create_at: { type: 'string|number', default: () => +new Date },
  last_active: { type: 'string|number', default: () => +new Date },
  actived: { type: 'string|number', default: 1 }
};