# farmOS-mobile-app

Native mobile app for recording farmOS observations (WORK IN PROGRESS)

Proposed functionality for a farmOS app version 1:

At the July 12 farmOS open call we discussed the following functionality for an initial version of the farmOS app:
- Store and edit data offline, and synch with farmOS server when the user goes online
- Create observation logs which could include a photo, text note, and current location (GPS coords from phone).  These logs would be linked to areas, and could also be linked to crop or livestock assets on the farm.
- Create or edit harvest logs for crop/ livestock assets. You could view existing harvest logs (i.e. scheduled harvests) and check them off as complete. You could also change quantities to match the actual harvest, or create a new log if you harvest something that was not previously scheduled.
- View all events in the farmOS database in calendar form.  This would encourage folks to schedule upcoming tasks with farmOS by creating future-dated events.
- Quickly connect the user to assets, areas, etc in their main farmOS using the web browser.



Proposed project structure:

Our goal at this point is to create two versions of a farmOS mobile app - one for iOS and one for Android.  The two versions will have equivalent functionality, but will need to be written separately.  The iOS app will be written in Swift using the Xcode IDE, and the Android app will be written in Java using the Android Studio IDE.  We will begin with the iOS version, as @BFAFisher has expressed interest in collaborating on the iOS side.

iOS app:
The iOS app will likely have these basic elements:
- An SQLite database controlled by the Core Data framework (this would be a stripped-down version of the main farmOS database)
- Components to add, remove, and edit records in the SQLite database
- An authentication system for obtaining and securely storing user credentials, and sharing those credentials with the farmOS server
- Components to get data from the farmOS server (in JSON format) and parse JSON files
- Components to send new records to the iOS server (this would involve checking native records against records on the server to identify new records, then sending the new records only)
- User interface elements allowing the user create new records and view existing records.
- Components to handle image files associated with observations, and send those files to the farmOS server along with observation records
- Calls to launch and get data from other native apps such as the web browser, GPS and camera controller.






