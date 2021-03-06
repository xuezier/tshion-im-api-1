module.exports = function(app) {

  const User = require('../../../models/user')(app);
  const Room = require('../../../models/room')(app);

  return {
    get: {
      'list': {
        docs: {
          name: '获取好友列表',
          params: []
        },
        method(req, res, next) {
          var user = req.user;

          User.getAllFriendsInfo(user._id).then(list => {
            return Room.getUserRoomMap(user._id.toHexString()).then(rooms => {
              var result = list.map(friend => {
                var room = rooms.find(item => ~item.members.indexOf(friend._id.toHexString()));

                friend.roomid = room.roomid;
                delete friend.friend;
                return friend;
              });
              // var result = rooms.map(room => {
              //   var friend = list.find(item => ~room.members.indexOf(item._id.toString()));
              //   friend.roomid = room.roomid;
              //   delete friend.friend;
              //   return friend;
              // });
              res.sendJson(result);
            });
          }).catch(next);
        }
      }
    }
  }
}
