/* eslint-disable */
const parameters_1 = {
  params: {
    dareaA: 1.9,
    dareaP: 2.2,
    dbedP: 1.5,
    dbathP: 1.4,
    dlotA: 0.5,
    dlotP: 1.5,
    disMax: 0.03,
    disL: 0.6,
    outlierOffset: 0.02,
    outlierNew: 0.2,
    iterateL: 0.15,
    iterateH: 0.5,
    iterateP: 1.6,
    trustCount: 300,
    medianDays: 50
  }
}

const NEIGHBOR_DIS = 0.005 // about 0.55km
const MAX_DIS = NEIGHBOR_DIS * 4 // about 2.2km
const DAY100 = 100 * 24 * 3600 * 1000
const DAY200 = DAY100 * 2
const DAY600 = DAY100 * 6
const DAY2000 = DAY200 * 10
const dBathOff = [1, 0.7, 0.4, 0.2, 0.1, 0.05, 0.04, 0.03, 0.02, 0.01, 0.001]
const dBedoff = [1, 0.7, 0.4, 0.2, 0.1, 0.05, 0.04, 0.03, 0.02, 0.01, 0.001]
function getBathOff (b1, b2) {
  b1 = (b1 + Math.ceil(b1)) / 2
  b2 = (b2 + Math.ceil(b2)) / 2
  let db12 = Math.min(b1, b2) / Math.max(b1, b2)
  return Math.pow(db12, parameters_1.params.dbathP)
}
// return result in degree (angle difference from Earth center)
// doesnt work when 2 locations are hundreds miles away from each other
function distance (lat1, lon1, lat2, lon2) {
  let d1 = lat1 - lat2
  let d2 = (lon1 - lon2) * Math.cos(((lat1 + lat2) * Math.PI) / 360)
  return Math.sqrt(d1 * d1 + d2 * d2)
}
// return result in degree (angle difference from Earth center)
// more accurate when 2 locations are far away
// when 2 locations are close, this is less accurate due to error in floating point number operation
function distanceFull (lat1, lon1, lat2, lon2) {
  let radlat1 = (Math.PI * lat1) / 180
  let radlat2 = (Math.PI * lat2) / 180
  let theta = lon1 - lon2
  let radtheta = (Math.PI * theta) / 180
  let dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta)
  if (dist > 1) {
    dist = 1
  }
  dist = Math.acos(dist)
  dist = (dist * 180) / Math.PI
  // dist = dist * 60 * 1.1515
  // if (unit=="K") { dist = dist * 1.609344 }
  // if (unit=="N") { dist = dist * 0.8684 }
  return dist
}
const baseSimilarity =
  ((80 - 0) *
    Math.pow(1.2 - 0, parameters_1.params.dlotP) *
    dBedoff[0] *
    1 *
    1 *
    1) /
  parameters_1.params.disL
const similarityMax = baseSimilarity / DAY600
function estimateOpt (records, targetHouse, idx, avgPrice) {
  //console.log(targetHouse)
  //parameters_1.loadParams(targetHouse.Zip);
  // get perform
  let references = []
  function comparePerform (other, mdis = MAX_DIS) {
    //if (other.ATTOMID == targetHouse.ATTOMID) return;
    if (targetHouse.time - other.time <= 0) {
      return
    }
    let dtime = Math.abs(other.time - targetHouse.time)
    if (!(dtime > DAY600)) {
      dtime = DAY600
    }
    if (other.time < new Date('2014-01-01').getTime()) {
      return
    }
    let similarity = other.s / dtime
    let targetPerform = targetHouse.perform
    if (
      typeof targetPerform === 'number' &&
      Math.abs(targetPerform) !== 0 &&
      targetHouse.time >= new Date('2014-01-01').getTime()
    ) {
      let dPerform = Math.abs(targetPerform - other.perform)
      if (dPerform > 1) dPerform = 1
      similarity *= Math.pow(1.01 - dPerform, 1.5)
      //console.log("perform: " + targetPerform)
    }
    references.push({ other, perform: other.perform, s: similarity, dtime })
  }
  for (let i = idx + 1; i < records.length; ++i) {
    let row = records[i]
    comparePerform(row)
  }
  if (references.length === 0) {
    for (let i = idx + 1; i < records.length; ++i) {
      let row = records[i]
      comparePerform(row, MAX_DIS * 3)
    }
  }
  if (references.length === 0) {
    return {
      estimated: avgPrice,
      estimatedMax: avgPrice,
      estimatedMin: avgPrice,
      accuracy: 0
    }
  }

  references.sort((a, b) => b.s - a.s)
  if (references.length > 8) {
    references.length = 8
  }
  references = filter(references, targetHouse)
  //console.log(references.length);
  //console.log("raw refs");
  //references = outlierFilter(references);
  //console.log("filtered refs");
  //for (let ref of references) {console.log(Math.pow(2.5, ref.perform) * avgPrice);}
  //OUTLIER DETECTION
  /*if (references.length > 2)
  {
    var pArr = [];
    for (let ref of references) {
      pArr.push(ref.perform);
    }
    var outliers = grubbsLib.test(pArr);
    //console.log(outliers[0].outliers);
    outliers = outliers[0].outliers;
    var filteredReferences = [];
    for (let ref of references) {
      var isOutlier=false;
      for (var i=0;i<outliers.length;i++)
      {
        if (ref.perform == outliers[i])
        {
          isOutlier = true;
          //console.log("outlier",outliers[i]);
          break;
        }
      }
      if (!isOutlier) filteredReferences.push(ref);
    }

    references = filteredReferences;
  }*/
  /*let prevS = references[0].s;
  for (let ref of references) {
    let dis = distance(targetHouse.lat, targetHouse.lon, ref.other.lat, ref.other.lon);
    let sDiff = prevS-ref.s;
    console.log("raw: ",ref.other.ATTOMID, Math.round(Math.pow(2.5, ref.perform) * avgPrice), Math.round(ref.other.ClosePricePerSqft), ref.s*1000000000, sDiff*1000000000, dis, ref.other.CloseDate, ref.other.FullAddress, ref.other.LivingArea, ref.other.LotSizeAcres, ref.other.BedroomsTotal, ref.other.BathroomsFull, ref.other.YearBuilt);
    //console.log("contextData: ", ref.other.contextData);
  }*/
  let performt = 0
  let performc = 0
  let performa = 0
  for (let ref of references) {
    performt += ref.perform * ref.s
    performc += ref.s
    performa += Math.pow(ref.s, 4)
    //console.log(ref);
  }
  let perform = performt / performc
  let estimated = Math.pow(2.5, perform) * avgPrice
  let avgs = performc / references.length
  let estimatedMax = -Infinity
  let estimatedMin = Infinity
  for (let ref of references) {
    let estimated1 = Math.pow(2.5, ref.perform) * avgPrice
    let estimated2 = (estimated1 * ref.s + estimated * avgs) / (avgs + ref.s)
    if (estimated2 > estimatedMax) estimatedMax = estimated2
    if (estimated2 < estimatedMin) estimatedMin = estimated2
  }

  let accuracy = Math.pow(performa, 0.25) / similarityMax
  /*let yearBuiltAgo = new Date(targetHouse.time).getFullYear() - Number(targetHouse.YearBuilt);
  if (yearBuiltAgo == 0)
  {
    estimated *= 1;
    estimatedMax *= 1;
  }*/
  return {
    estimated,
    estimatedMax,
    estimatedMin,
    accuracy,
    references,
    targetHouse
  }
}

// filter data by lat lon, so it can be reused when estimate house with different feature
// moreDistance: min value 1, max value 3
// increase moreDistance would add more data, it might have some small improvement on house with unusual features
function filterRelevantDataRaw (records, targetHouse, moreDistance = 1) {
  let result0 = []
  let maxdis = parameters_1.params.disMax * moreDistance
  for (let other of records) {
    if (other.perform == null || other.trusted <= 0) {
      continue
    }
    let dis = distance(targetHouse.lat, targetHouse.lon, other.lat, other.lon)
    if (dis > maxdis) continue
    dis /= NEIGHBOR_DIS
    if (dis < 1) {
      dis = Math.sqrt(dis)
      if (dis < parameters_1.params.disL) {
        dis = parameters_1.params.disL
      }
    }
    let dtime = Math.abs(other.time - targetHouse.time)
    if (dtime > DAY2000) dtime = DAY2000
    let dzip = other.Zip === targetHouse.Zip ? 1 : 0.001
    let darea = Math.abs(other.LivingArea - targetHouse.LivingArea)
    darea /= targetHouse.LivingArea / parameters_1.params.dareaA
    if (!(darea < 0.99)) {
      darea = 0.99
    }
    let dbed =
      Math.min(other.BedroomsTotal, targetHouse.BedroomsTotal) /
      Math.max(other.BedroomsTotal, targetHouse.BedroomsTotal)
    let dbath = getBathOff(other.BathroomsFull, targetHouse.BathroomsFull)
    let duse =
      String(other.Use).toUpperCase() === String(targetHouse.Use).toUpperCase()
        ? 1
        : 0.1
    let dbuilt = Math.abs(other.YearBuilt - targetHouse.YearBuilt)
    if (!(dbuilt < 50)) dbuilt = 50
    let dlot = Math.abs(other.LotSizeAcres - targetHouse.LotSizeAcres)
    dlot /= targetHouse.LotSizeAcres / parameters_1.params.dlotA
    if (!(dlot < 1)) {
      dlot = 1
    }
    let dgarage = Math.abs(other.GarageSpaces - targetHouse.GarageSpaces)
    let similarity =
      ((80 - dbuilt) *
        Math.pow(1.2 - dlot, parameters_1.params.dlotP) *
        Math.pow(dbed, parameters_1.params.dbedP) *
        dzip *
        dbath *
        Math.pow(1 - darea, parameters_1.params.dareaP) *
        duse) /
      dis
    /*var rawObj:any = {"dbuilt":(80 - dbuilt),"dlot": Math.pow(1.2 - dlot, 2), "dbed": dBedoff[dbed], "zip": dzip, "dbath":dbath, "darea": Math.pow(1 - darea, 2), "duse": duse, "dis": dis}
      other.contextData = rawObj;*/
    if (dis > 0) {
      similarity *= other.trusted
    }
    if (similarity > 0) {
      other.s = similarity
      result0.push(other)
    }
  }
  let minSimd = baseSimilarity * 0.001
  let minSim = minSimd
  // reduce size of filtered data
  while (result0.length > 600) {
    result0 = result0.filter(row => row.s > minSim)
    minSim *= 1.5
  }
  return result0
}

function filterRelevantData (records, targetHouse) {
  let result = filterRelevantDataRaw(records, targetHouse)
  if (result.length === 0) {
    return result
  }
  if (result.length < 200) {
    result = filterRelevantDataRaw(
      records,
      targetHouse,
      Math.sqrt(400 / result.length)
    )
  }
  return result
}

export function estimate (records, targetHouse, idx, avgPrice = -1, zipScore) {
  let filteredData = filterRelevantData(records, targetHouse)
  return estimateOpt(filteredData, targetHouse, -1, avgPrice)
}

export function logPerform (v) {
  // if (v !== v) return -0
  return Math.log(v) / Math.log(2.5)
}

function filter (references, targetHouse) {
  if (references.length < 3) {
    return references
  }
  let prct = 0
  let prcc = 0
  for (let ref of references) {
    ref.prc = Math.pow(2.5, ref.perform)
    prct += ref.prc * ref.s
    prcc += ref.s
  }
  let prcAvg = prct / prcc
  let prcdd = 0
  for (let ref of references) {
    prcdd += Math.pow(ref.prc - prcAvg, 2) * ref.s
  }
  let deviation = Math.sqrt(prcdd / prcc)
  if (targetHouse.Month / 12 - targetHouse.YearBuilt < 1) {
    /*
      median error: 7.931835437795214 %
  average error: 11.540312465058463 %
  */
    prcAvg += deviation * parameters_1.params.outlierNew
  } else {
    prcAvg += deviation * parameters_1.params.outlierOffset
  }
  let baseError = deviation / (prcc / references.length)
  let result = []
  function filterResults () {
    return references.filter(
      ref =>
        Math.abs(ref.prc - prcAvg) / ref.s < // weighted by similarity, allow similar record to stage in result
        baseError
    )
  }
  if (deviation > 0) {
    result = filterResults()
    if (result.length < 2) {
      while (result.length < 2) {
        baseError *= 1.2
        result = filterResults()
      }
    } else if (result.length > 6) {
      // dont need more than 5 results
      while (result.length > 6) {
        baseError *= 0.9
        result = filterResults()
      }
      if (result.length === 0) {
        baseError /= 0.9
        result = filterResults()
      }
    }
  } else {
    result = references
  }
  return result
}

export const targetDates = [
  /* '2014-01-01',
  '2014-02-01',
  '2014-03-01',
  '2014-04-01',
  '2014-05-01',
  '2014-06-01', */
  '2014-07-01',
  '2014-08-01',
  '2014-09-01',
  '2014-10-01',
  '2014-11-01',
  '2014-12-01',
  '2015-01-01',
  '2015-02-01',
  '2015-03-01',
  '2015-04-01',
  '2015-05-01',
  '2015-06-01',
  '2015-07-01',
  '2015-08-01',
  '2015-09-01',
  '2015-10-01',
  '2015-11-01',
  '2015-12-01',
  '2016-01-01',
  '2016-02-01',
  '2016-03-01',
  '2016-04-01',
  '2016-05-01',
  '2016-06-01',
  '2016-07-01',
  '2016-08-01',
  '2016-09-01',
  '2016-10-01',
  '2016-11-01',
  '2016-12-01',
  '2017-01-01',
  '2017-02-01',
  '2017-03-01',
  '2017-04-01',
  '2017-05-01',
  '2017-06-01',
  '2017-07-01',
  '2017-08-01',
  '2017-09-01',
  '2017-10-01',
  '2017-11-01',
  '2017-12-01',
  '2018-01-01',
  '2018-02-01',
  '2018-03-01',
  '2018-04-01',
  '2018-05-01',
  '2018-06-01',
  '2018-07-01',
  '2018-08-01',
  '2018-09-01',
  '2018-10-01',
  '2018-11-01',
  '2018-12-01',
  '2019-01-01',
  '2019-02-01',
  '2019-03-01',
  '2019-04-01',
  '2019-05-01',
  '2019-06-01',
  '2019-07-01',
  '2019-08-01',
  '2019-09-01',
  '2019-10-01',
  '2019-11-01',
  '2019-12-01',
  '2020-01-01',
  '2020-02-01'
]