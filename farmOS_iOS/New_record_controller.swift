//
//  New_record_controller.swift
//  farmOS_iOS
//
//  Created by Alex Smith on 8/7/17.
//  Copyright © 2017 farmOS. All rights reserved.
//

import UIKit

//Controller for New_record view
// Currently focused on capturing harvest records
// Can be expanded to capture other kinds of records
//Functions:
// Enter new harvest record including crop, location, unit and quantity
// Save to local database as New_harvests
// Call check_connection

class New_record_controller: UITableViewController {

    var sendRecords = Send_records()
    
    var xcsrf_token = ""

    var responseString = ""
    
    @IBOutlet weak var statusText: UILabel!
    
    @IBOutlet weak var nameTextbox: UITextField!
    
    @IBOutlet weak var bodyTextbox: UITextField!

    @IBOutlet weak var submitButton: UIButton!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        //Add listeners to for changes to textboxes
        nameTextbox.addTarget(self, action: #selector(editingChanged(_:)), for: .editingChanged)
        bodyTextbox.addTarget(self, action: #selector(editingChanged(_:)), for: .editingChanged)

        
        //The submit button starts out as disabled.  It will be enabled when values are entered into all text boxes
        submitButton.isEnabled = false
        
        // Uncomment the following line to preserve selection between presentations
        // self.clearsSelectionOnViewWillAppear = false

        // Uncomment the following line to display an Edit button in the navigation bar for this view controller.
        // self.navigationItem.rightBarButtonItem = self.editButtonItem()
    }

    
    @IBAction func submitButtonPressed(_ sender: Any) {
    
        sendRecords.nameInput = self.nameTextbox.text!
        sendRecords.bodyInput = self.bodyTextbox.text!
        
        //submitPressed will only function if a farmOS url is saved to key baseURL
        if let savedURL = UserDefaults.standard.string(forKey: "baseURL") {
            
            self.statusText.text = "Sending observation to "+savedURL
            
            self.sendRecords.getToken() { tokenResponse in
            //self.sendRecords.getToken() { responseObject in
                
                print("***SEND RESPONSE: \(String(describing: tokenResponse))")
                
                //if a webpage is being returned, it will contain an 'html' tag.  This is a failure
                if tokenResponse.range(of:"html") != nil || tokenResponse.range(of:"invalid credentials") != nil{
                    
                    self.responseString = "No token returned - error or html returned"
                    
                    //self.performSegue(withIdentifier: "NewCredentialsSegue", sender: self)
                    
                } else {
                    
                    self.xcsrf_token = String(describing: tokenResponse)
                    self.sendRecords.xcsrf_token = self.xcsrf_token

                    self.sendRecords.makeRequest() { sendResponse in
                        
                        print("NEW RECORD POST RESPONSE:")
                        print(sendResponse)
                        self.responseString = sendResponse as! String
    
                        //And display response string
                        self.statusText.text = self.responseString

                    }// end makeRequest
                    
                    }//end token else
                
                //Gotta reload data after waiting on the asynch task!
                self.tableView.reloadData()
                
                //Return getButton to normal (unpressed) color
                self.submitButton.backgroundColor = UIColor.blue
                
            }// close getToken()
            
        } // close if savedURL
        
    } //close submitButtonPressed

    
//Thanks Leo Dabus https://stackoverflow.com/questions/34941069/enable-a-button-in-swift-only-if-all-text-fields-have-been-filled-out
 func editingChanged(_ textField: UITextField) {
 if textField.text?.characters.count == 1 {
 if textField.text?.characters.first == " " {
 textField.text = ""
 return
 }
 }
 guard
    let name = nameTextbox.text, !name.isEmpty,
    let body = bodyTextbox.text, !body.isEmpty
 else {
 submitButton.isEnabled = false
 return
 }
 submitButton.isEnabled = true
 }
    
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    // MARK: - Table view data source



    /*
    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "reuseIdentifier", for: indexPath)

        // Configure the cell...

        return cell
    }
    */

    /*
    // Override to support conditional editing of the table view.
    override func tableView(_ tableView: UITableView, canEditRowAt indexPath: IndexPath) -> Bool {
        // Return false if you do not want the specified item to be editable.
        return true
    }
    */

    /*
    // Override to support editing the table view.
    override func tableView(_ tableView: UITableView, commit editingStyle: UITableViewCellEditingStyle, forRowAt indexPath: IndexPath) {
        if editingStyle == .delete {
            // Delete the row from the data source
            tableView.deleteRows(at: [indexPath], with: .fade)
        } else if editingStyle == .insert {
            // Create a new instance of the appropriate class, insert it into the array, and add a new row to the table view
        }    
    }
    */

    /*
    // Override to support rearranging the table view.
    override func tableView(_ tableView: UITableView, moveRowAt fromIndexPath: IndexPath, to: IndexPath) {

    }
    */

    /*
    // Override to support conditional rearranging of the table view.
    override func tableView(_ tableView: UITableView, canMoveRowAt indexPath: IndexPath) -> Bool {
        // Return false if you do not want the item to be re-orderable.
        return true
    }
    */

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

}
