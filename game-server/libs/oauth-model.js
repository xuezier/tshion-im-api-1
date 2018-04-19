'use strict';

var {getUserInfoCache, getAccessTokenCache, setUserAccessTokenRelation} = require('./cache');

module.exports = function (app) {
  const tlf2_db = app.tlf2_db;
  const ObjectID = app.get('ObjectID');

  // const accesstokenCollection = tlf_db.collection('oauth.accesstoken');//改为redis获取

  return {
    getAccessToken(bearerToken, callback) {
      // console.log(bearerToken)
      // console.log('# getAccessToken (bearerToken: ' + bearerToken + ')');
      getAccessTokenCache(bearerToken).then(info => {
        // console.log(info);
        if (info) {
          return getUserInfoCache(info.user_id).then(user => {
            // console.log(user);
            user._id = ObjectID(user._id);
            info.user = user;
            return callback(null, info);
          });
        } else {
          // find access is exists
          return app.Redis.get(bearerToken).then(uid => {
            if (!uid) {
              return callback(null, null);
            }

            return tlf2_db.find("tlf_user", {
              id: uid
            }, {
              _id: 1,
              name: 1,
              email: 1,
              mobile: 1,
              avatar: 1,
              // 'wechat.openid': 1
            })
              .then(res => {
                let user = res[0];
                console.log(user);
                let token = {user_id: uid, user: user};
                return setUserAccessTokenRelation(user, token)
                  .then(() => {
                    callback(null, token);
                  });
              });
          });
        }
      }).catch(callback);
    },
  };
};
