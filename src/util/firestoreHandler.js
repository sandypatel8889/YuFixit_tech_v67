import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import database, { firebase } from "@react-native-firebase/database";
import functions from "@react-native-firebase/functions";
import { Platform } from "react-native";
const { GeoFire } = require("geofire");

export const registerUser = (data) => {
  if (data.data) {
    return firestore().collection("Providers").add(data.data);
  } else {
    return firestore().collection("Providers").add(data);
  }
};

export const addDeviceToken = (id, token) => {
  return firestore()
    .collection("Providers")
    .doc(id)
    .update({ deviceToken: token });
};
//add address to user data
export const addAddress = (id, data) => {
  return firestore()
    .collection("Providers")
    .doc(id)
    .update({ addresses: data });
};

//add service to user data
export const addService = (id, data) => {
  return firestore().collection("Providers").doc(id).update({ services: data });
};

//get user data
export const getUserData = (id) => {
  return firestore().collection("Providers").doc(id).get();
};
//get user by email
export const getUserByEmail = (email) => {
  return firestore().collection("Providers").where("email", "==", email).get();
};

//get customer data
export const getCustomerData = (id) => {
  return firestore().collection("Customers").doc(id).get();
};

// get user data from firebase
export const getCustomerDataByEmail = (email) => {
  return firestore().collection("Customers").where("email", "==", email).get();
};

export const fetchCategories = () => {
  return firestore().collection("Categories").get();
};

//add image to firestore
export const updatePersonalInfo = (id, personalInfo) => {
  return firestore()
    .collection(`Providers`)
    .doc(id)
    .update({ personalInfo: personalInfo });
};

export const addName = (id, token) => {
  return firestore()
    .collection("Providers")
    .doc(id)
    .update({ name: token });
};
export const addFacebookLink = (id, url) => {
  return firestore()
    .collection("Providers")
    .doc(id)
    .update({ facebookLink: url });
};
export const addInstaLink = (id, url) => {
  return firestore()
    .collection("Providers")
    .doc(id)
    .update({ instaLink: url });
};
export const addTwitterLink = (id, url) => {
  return firestore()
    .collection("Providers")
    .doc(id)
    .update({ twitterLink: url });
};
export const addTiktokLink = (id, url) => {
  return firestore()
    .collection("Providers")
    .doc(id)
    .update({ tiktokLink: url });
};
export const handleEnableDisable = (id, value) => {
  return firestore()
    .collection("Providers")
    .doc(id)
    .update({ isEnable: value });
};
//add image to firestore
export const updateProviderName = (id, newName) => {
  return firestore()
    .collection(`Providers`)
    .doc(id)
    .update({ name: newName });
};
//add image to firestore
export const updateProviderSubscriptionDate = (id, newdate) => {
  return firestore()
    .collection(`Providers`)
    .doc(id)
    .update({ Expirydate: newdate });
};
export const updateProviderSubscriptionDate_call = (id, newdate) => {
  return firestore()
    .collection(`Providers`)
    .doc(id)
    .update({ Expirydate_call: newdate });
};

//add image to firestore
export const updateProviderSkills = (id, newSkills) => {
  return firestore()
    .collection(`Providers`)
    .doc(id)
    .update({ skills: newSkills });
};

//add image to storage
export const addProfileImage = (path, filename, cb) => {
  storage()
    .ref(`providers/${filename}`)
    .putFile(path)
    .then(async (res) => {
      try {
        const url = await storage()
          .ref(`providers/${filename}`)
          .getDownloadURL();
        cb(true, url);
      } catch (err) {
        cb(false, null);
      }
    })
    .catch((err) => {
      cb(false, null);
      console.log("error in uploading image is: ", err);
    });
};
// adding message media
export const addMessageMedia = (path, filename, cb) => {
  storage()
    .ref(`messages/${filename}`)
    .putFile(path)
    .then(async (res) => {
      try {
        const url = await storage()
          .ref(`messages/${filename}`)
          .getDownloadURL();
        cb(true, url);
      } catch (err) {
        cb(false, null);
      }
    })
    .catch((err) => {
      cb(false, null);
      console.log("error in uploading image is: ", err);
    });
};

//upload video to storage
export const uploadVideo = (path, filename, cb) => {
  storage()
    .ref(`providers/${filename}`)
    .putFile(path)
    .then(async (res) => {
      try {
        const url = await storage()
          .ref(`providers/${filename}`)
          .getDownloadURL();
        cb(true, url);
      } catch (err) {
        cb(false, null);
      }
    })
    .catch((err) => {
      cb(false, null);
      console.log("error in uploading video is: ", err);
    });
};
// adding video to firestore
export const addVideo = (id, data) => {
  return firestore().collection("Providers").doc(id).update({ videos: data });
};
export const addImages = (id, data) => {
  return firestore().collection("Providers").doc(id).update({ images: data });
};
export const addAutoResponder = (id, data) => {
  return firestore().collection("Providers").doc(id).update({ replys: data });
};
export const addinvites = (id, data) => {
  return firestore().collection("Providers").doc(id).update({ invites: data });
};

function getRefToStorage(URL) {
  const baseURL = 'https://firebasestorage.googleapis.com/v0/b/my-project-1549807020614.appspot.com/o/';
  let imagePath = URL.replace(baseURL, '');
  const indexOfEndPath = imagePath.indexOf('?');
  imagePath = imagePath.substring(0, indexOfEndPath);
  imagePath = decodeURIComponent(imagePath);
  return imagePath;
}

//upload video to storage
export const deleteVideo = (url, cb) => {
  let refPath = getRefToStorage(url)
  console.log("url: ", refPath)
  storage()
    .ref(refPath)
    .delete()
    .then(async (res) => {
      try {
        console.log(res)
        cb(true, url);
      } catch (err) {
        cb(false, null);
      }
    })
    .catch((err) => {
      cb(false, null);
      console.log("error in deleting video is: ", err);
    });
};

//handle going online/offline
export const handleOnlinOffline = (id, value) => {
  return firestore()
    .collection("Providers")
    .doc(id)
    .update({ isActive: value });
};

// getting booking from firestore
export const getBookings = (id) => {
  return firestore().collection("Bookings").where("provider", "==", id).get();
};

export const getBooking = (id) => {
  return firestore().collection("Bookings").doc(id).get();
};
// getting chatkey from databse
export const getChatKey = (searching) => {
  return database()
    .ref()
    .child("chattings")
    .orderByChild("searching")
    .equalTo(searching)
    .once("value");
};

// sending message to the customer
export const sendMessageToCustomer = (chatKey, message) => {
  console.log("chat key is: ", chatKey);
  return functions().httpsCallable("sendMessageToCustomer")({
    chatKey,
    message,
  });
};

// method for enabling module
export const enableModules = (id, modules, total) => {
  return functions().httpsCallable("enableModules")({
    id,
    modules,
    total,
  });
};

// method for getting the booking count
export const getBookingsCounts = (id) => {
  return firestore()
    .collection("Bookings")
    .where("provider", "==", id)
    .get()
    .then((res) => {
      if (res.docs.length > 0) {
        let pendings = [];
        let upcomings = [];
        res.docs.map((doc) => {
          let temp = { ...doc.data(), id: doc.id };
          if (temp.status == "pending") {
            pendings.push(temp);
          } else if (temp.status == "accepted") {
            upcomings.push(temp);
          }
        });
        return { pendings: pendings.length, upcomings: upcomings.length };
      } else {
        return { pendings: 0, upcomings: 0 };
      }
    })
    .catch((err) => {
      return [];
      console.log("Error in getting pending bookings is: ", err);
    });
};
// FIREBASE FUNCTIONS

// Request accepted by the provider
export const acceptByProvider = (
  id,
  providerName,
  providerId,
  customerName,
  customerId
) => {
  return functions().httpsCallable("acceptByProvider")({
    id,
    providerName,
    providerId,
    customerName,
    customerId,
  });
};
// Request rejected by the provider
export const rejectByProvider = (
  id,
  providerName,
  providerId,
  customerName,
  customerId
) => {
  return functions().httpsCallable("rejectByProvider")({
    id,
    providerName,
    providerId,
    customerName,
    customerId,
  });
};

//method  setting the location

export const setLocation = (id, lat, long) => {
  var _geoFire = new GeoFire(database().ref("providersLocation"));
  _geoFire.set(id, [lat, long]).then(
    function () {
      console.log("Provided key has been added to GeoFire");
    },
    function (error) {
      console.log("Error: " + error);
    }
  );
};

// method for getting all of the provider on the basis of category
export const addProviderToCategory = (userId, categoryId) => {
  return functions().httpsCallable("addProviderToCategory")({
    userId,
    categoryId,
  });
};

export const notifyUser = (tokens, title, body) => {

  let data = {
    direct_book_ok: true,
    registration_ids: tokens,
    data: {
      message: body,
    },
    notification: {
      title,
      body,
      sound: Platform.OS == "ios" ? "Custom.wav" : "custom.wav",
      badge: 1
    },
    priority: "high"
  }

  let jsonData = JSON.stringify(data)
  console.log("data:", jsonData)
  fetch("https://fcm.googleapis.com/fcm/send", {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: "key=AAAADBNjqPE:APA91bHfVUhd4fy87G4eSUBPIjwtLV0OTSbS9X5vfUD_JJjHvnSTpQpN2m7idObHfB04R1X8uz9XDVD58G7ZnGES-Q_DkhgumeTQrmd1D8wd_xlNZml1H2gJblvMSkVHg_TdcPcQTgFc"
    },
    body: jsonData
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("response: ", data)
    })
    .catch((error) => {
      console.log("error: ", error);
    });
}

// adding credit card in firestore
export const addNotification = (uniqueKey, notification) => {
  return firestore().collection("Notifications").doc(uniqueKey).set(notification);
};
// method for getting the notification
export const getNotifications = (id) => {
  return firestore().collection("Notifications").where("to", "==", id).get();
};
// method for comming provider watch on map
export const comingProvider = (booking) => {
  return functions().httpsCallable("comingProvider")({
    ...booking,
  });
};
// method for handling the start job
export const startedJob = (booking) => {
  return functions().httpsCallable("startedJob")({
    ...booking,
  });
};
// method for complete job
export const completeJob = (booking) => {
  return functions().httpsCallable("completeJob")({
    ...booking,
  });
};
// method for adding amount
export const addAmount = (payment) => {
  return functions().httpsCallable("addAmount")({
    ...payment,
  });
};

// method for uploading the profile data
export const uploadProfileData = (
  id,
  personalInfo,
  skills,
  creditCardInfo,
  modules,
  addresses,
  services
) => {
  return firestore()
    .collection("Providers")
    .doc(id)
    .update({ personalInfo, skills, creditCardInfo, modules, addresses, services });
};

export const addRating = (id, data) => {
  return firestore().collection("Providers").doc(id).update({ ratings: data });
};

export const findRated = (id) => {
  return firestore().collection("Providers").doc(id).get();
};

// method for adding category
export const addToCategory = (userId, categoryId) => {
  firestore()
    .collection("Categories")
    .doc(categoryId)
    .get()
    .then((d) => {
      const category = d.data();
      if (category) {
        if (category.providers) {
          if (category.providers.indexOf(userId) > -1) {
          } else {
            let providers = category.providers;
            providers.push(userId);
            firestore()
              .collection("Categories")
              .doc(categoryId)
              .update({ providers: providers });
          }
        } else {
          firestore()
            .collection("Categories")
            .doc(categoryId)
            .update({ providers: [userId] });
        }
      }
    });
};


