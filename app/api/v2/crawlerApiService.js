var SteamUser = require('../../models/steamUser');

var service = {
  findProfileBySteamId : findProfileBySteamId,
  findProfilesBySteamIds : findProfilesBySteamIds,
  findProfilesWithPersonaHistory : findProfilesWithPersonaHistory,
  persistProfile : persistProfile,
  persistProfiles : persistProfiles
}

function findProfileBySteamId(id, res) {
  var match = {
    $match: {
      steamid: id,
    }
  }
  var sort = {
    $sort: {
      createdAt : -1
    }
  }
  var group = {
    $group: {
      _id : "$steamid",
      profile : { $first : "$$ROOT" },
      personahistory : { $push : "$$ROOT" }
    }
  }
  SteamUser
    .aggregate([match, sort, group])
    .exec(function (err, user) {
      if (err)
        console.log(err.stack);
      res.send(transformAggregateResponse(user[0]));
    })
}

function findProfilesBySteamIds(ids, res) {
  var match = {
    $match: {
      $and : [
        { steamid: { $in : ids } }
      ]
    }
  }
  var sort = {
    $sort: {
      createdAt : -1
    }
  }
  var group = {
    $group: {
      _id : "$steamid",
      profile : { $first : "$$ROOT" },
      personahistory : { $push : "$$ROOT" }
    }
  }
  SteamUser
    .aggregate([match, sort, group])
    .exec(function (err, users) {
      if (err)
        console.log(err.stack);
      var profiles = [];
      for (var i in users) {
        profiles.push(transformAggregateResponse(users[i]));
      }
      res.send(profiles);
    })
}

function findProfilesWithPersonaHistory(res) {
  SteamUser
    .find({ $where: "this.personahistory.length > 0" })
    .exec(function(err, profiles) {
      if (err)
        console.log(err.stack);
      res.send(profiles);
    })
}

function persistProfile(profile, res) {
  SteamUser
    .create(profile, function (err, profile) {
      if (err)
        console.log(err);
      findProfileBySteamId(profile.steamid, res);
    })
}

function persistProfiles(profiles, res) {
  SteamUser
    .insertMany(profiles, function (err, profiles) {
      if (err)
        console.log(err);
      res.send(profiles);
    })
}

function transformAggregateResponse(response) {
  var profile = response.profile;
  profile._id = response._id;
  profile.personahistory = response.personahistory;
  return profile;
}

module.exports = service;