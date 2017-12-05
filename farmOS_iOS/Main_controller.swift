//
//  ViewController.swift
//  farmOS_iOS
//
//  Created by Alex Smith on 8/3/17.
//  Copyright © 2017 farmOS. All rights reserved.
//

import UIKit


/*EVENTUAL FUNCTIONALITY:
Controller for the main app view, which will appear on loading.  Users can move from here to any other view.
Functions:
Enter observation, associated with a location and /or crop
Open camera app, take a picture, and associate that picture with the observation
Save to local database as New_observations
Call Check_connection
*/

/*CURRENT FUNCTIONALITY:
 Retrieves planting records using Get_records if the app holds a farmOS URL and valid authentication token for that URL
 If the app does not hold a URL and/ or token, segues to the Credentials view so the user can log in
 Also segues to credentials if the retrieved data are not a csv - for example, if the token is no longer valid or if the url is wrong, the response may be an html page announcing a 404 error or something along those lines
 */


class Main_controller: UITableViewController {

    var records = Get_records()

    @IBOutlet weak var outputText: UITextView!
    
    @IBOutlet weak var getButton: UIButton!
    
    @IBOutlet weak var addButton: UIButton!
    
    
    override func viewDidLoad() {
        super.viewDidLoad()

        print("Loaded main view controller")

        //Check for a saved url value in user settings.  If none exists, open the login page.
        if let savedURL = UserDefaults.standard.string(forKey: "baseURL") {
            outputText.text = "Ready to retrieve records from "+savedURL
        } else {
          self.performSegue(withIdentifier: "credentialsSegue", sender: self)
        }
        
    }//end viewDidLoad
    
    

    //getRecords calls the get_records class to request records from the farmOS server.
   
    func getRecords() {
        
        //getRecords will only function if a farmOS url is saved to key baseURL
         if let savedURL = UserDefaults.standard.string(forKey: "baseURL") {

        self.outputText.text = "Waiting for a response from "+savedURL
        
            //By default, the response string is a header for the output values
            var responseString = ""

        self.records.makeRequest() { returnDict in
            
            print("***RECORDS: \(returnDict)")
            
            
            if returnDict["Status"]! == ["Error"] {
            
            //if a webpage is being returned, it will contain an 'html' tag.  This is a failure
            //if responseObject.range(of:"html") != nil || responseObject.range(of:"invalid credentials") != nil{
                
                responseString = "Incorrect URL, username or password"
                
                self.performSegue(withIdentifier: "credentialsSegue", sender: self)
                
            } else {
                responseString = "Name; Id; Type; Timestamp \n\n"
                
                let returnNames = returnDict["Names"]!
                let returnIds = returnDict["Ids"]!
                let returnTypes = returnDict["Types"]!
                let returnStamps = returnDict["Timestamps"]!
                
                for i in 0 ..< returnNames.count {
                    
                    responseString = responseString+returnNames[i]+"; "
                    responseString = responseString+returnIds[i]+"; "
                    responseString = responseString+returnTypes[i]+"; "
                    responseString = responseString+returnStamps[i]
                    responseString = responseString+"\n\n"
                }
            } //end if returnDict[Status]
            
            print(responseString)
            
            self.outputText.text = responseString
            
            //Gotta reload data after waiting on the asynch task!
            self.tableView.reloadData()
            
            //Finally return getButton to normal (unpressed) color
            self.getButton.backgroundColor = UIColor.blue
            
            return
        } //close records.makeRequest
        
        } //end if baseURL
        
    }// end func getRecords
    
    
    
    @IBAction func getRecordsPressed(_ sender: Any) {
        
        getRecords()
        
        //Change button color to indicate press
        getButton.backgroundColor = UIColor.gray
        
    }
    
    
    @IBAction func addObservationPressed(_ sender: Any) {
        
        self.performSegue(withIdentifier: "addSegue", sender: self)
        
        //Change button color to indicate press
        addButton.backgroundColor = UIColor.gray
        
    }
    
    
    //accept unwind segues
    @IBAction func unwindToMain(segue:UIStoryboardSegue) {
        
        getRecords()
        
    }


    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
        
    }
    
    



}

