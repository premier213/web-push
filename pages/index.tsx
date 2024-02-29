import { useEffect, useState } from "react";
import Head from "next/head";
import { pushInstance } from "../public/config";
import Pusher from "pusher-js";
import React from "react";

const base64ToUint8Array = (base64) => {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(b64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const pusherKey = "56d56355b6cc996b754bab712e42aae6";
const pusherCluster = "mt1";
const pusherHost = "socket.tjmkk.com";
const pusherPort = 6002;

export const pusher = new Pusher(pusherKey, {
  cluster: pusherCluster,
  httpHost: pusherHost,
  httpPort: Number(pusherPort),
  wsHost: pusherHost,
  wsPort: Number(pusherPort),
  authorizer: (channel) => ({
    authorize: (socketId, callback) => {
      pushInstance
        .post("/broadcasting/auth", {
          socket_id: socketId,
          channel_name: channel.name,
        })
        .then((response) => callback(null, response.data))
        .catch((error) => callback(new Error("Error occurred"), error));
    },
  }),
});

const Index = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker
          .register("/sw.js")
          .then(function (registration) {
            console.log(
              "Service Worker registered with scope:",
              registration.scope
            );
            var channel = pusher.subscribe(`private-rates.1`);
            channel.bind("rates.update.price", function (data) {
              console.log("🎯 #61-pages/index.tsx", data);
              // Handle the event and display the notification in Chrome
              if (Notification.permission === "granted") {
                new Notification("New Notification", {
                  body: data.price_buy,
                  icon: "/icon.png",
                });
              }
            });
          })
          .catch(function (error) {
            console.error("Service Worker registration failed:", error);
          });
      });
    }
  }, []);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      (window as any).workbox !== undefined
    ) {
      // run only in browser
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (
            sub &&
            !(
              sub.expirationTime &&
              Date.now() > sub.expirationTime - 5 * 60 * 1000
            )
          ) {
            setSubscription(sub);
            setIsSubscribed(true);
          }
        });
        setRegistration(reg);
      });
    }
  }, []);

  const subscribeButtonOnClick = async (event) => {
    event.preventDefault();
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8Array(
        process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY
      ),
    });
    console.log("🚀 ~ subscribeButtonOnClick ~ sub:", sub);
    // TODO: you should call your API to save subscription data on server in order to send web push notification from server
    setSubscription(sub);
    setIsSubscribed(true);
    console.log("web push subscribed!");
    console.log(sub);
  };

  const unsubscribeButtonOnClick = async (event) => {
    event.preventDefault();
    await subscription.unsubscribe();
    // TODO: you should call your API to delete or invalidate subscription data on server
    setSubscription(null);
    setIsSubscribed(false);
    console.log("web push unsubscribed!");
  };

  const sendNotificationButtonOnClick = async (event) => {};

  return (
    <>
      <Head>
        <title>next-pwa example</title>
      </Head>
      <h1>Next.js + PWA = AWESOME!</h1>
      <button onClick={subscribeButtonOnClick} disabled={isSubscribed}>
        Subscribe
      </button>
      <button onClick={unsubscribeButtonOnClick} disabled={!isSubscribed}>
        Unsubscribe
      </button>
      <button onClick={sendNotificationButtonOnClick} disabled={!isSubscribed}>
        Send Notification
      </button>
    </>
  );
};

export default Index;
