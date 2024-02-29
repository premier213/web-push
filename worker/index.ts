"use strict";

self.addEventListener("push", function (event: any) {
  const notificationData = event.data.json();

  event.waitUntil(
    (self as any).registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
    })
  );
});

self.addEventListener("notificationclick", function () {
  console.log("🎯 #43-worker/index.ts", 22222222);
});
