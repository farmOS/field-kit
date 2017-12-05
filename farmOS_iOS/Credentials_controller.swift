//
//  Credentials_controller.swift
//  farmOS_iOS
//
//  Created by Alex Smith on 11/15/17.
//  Copyright © 2017 farmOS. All rights reserved.
//

import Foundation
import UIKit


/*CURRENT FUNCTIONALITY
 Gathers farmOS URL, username and password from the user
 Passes to Check_credentials, which attempts to retrieve an authentication token from the server
 If successful, segues the user back to the main_controller where they may retrieve and view records

 */


class Credentials_controller: UITableViewController {
    
    var credentials = Check_credentials()
    
    @IBOutlet weak var statusText: UILabel!
    @IBOutlet weak var userTextbox: UITextField!
    @IBOutlet weak var passwordTextbox: UITextField!
    @IBOutlet weak var urlTextbox: UITextField!
    
    @IBOutlet weak var submitButton: UIButton!
    
   
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        //Add listeners to for changes to textboxes
        urlTextbox.addTarget(self, action: #selector(editingChanged(_:)), for: .editingChanged)
        userTextbox.addTarget(self, action: #selector(editingChanged(_:)), for: .editingChanged)
        passwordTextbox.addTarget(self, action: #selector(editingChanged(_:)), for: .editingChanged)
        
        self.statusText.text = "Please enter values for all fields"

        //The submit button starts out as disabled.  It will be enabled when values are entered into all three text boxes
        submitButton.isEnabled = false
    }
    
    
    @IBAction func submitPressed(_ sender: Any) {
        
        //Change button color to indicate press
        submitButton.backgroundColor = UIColor.gray
        
        //Gather user inputs from textboxes
        credentials.farmOSusername = self.userTextbox.text!
        credentials.farmOSpassword = self.passwordTextbox.text!
        credentials.newBaseURL = self.urlTextbox.text!
        
        //Indicate that a request has been submitted
        self.statusText.text = "Requesting access to "+credentials.newBaseURL
        
        credentials.makeRequest() { responseObject in
            // use responseObject and error here
            
            print("***RESPONSE: \(responseObject)")
            
            if responseObject == "success" {
                
                //unwind segue
                self.performSegue(withIdentifier: "unwindToMain", sender: self)
                
            } else {
                self.statusText.text = "Invalid username, password or URL"
                print("No way - your credentials are all messed up!")
            }
            
            return
        } // close credentials makeRequest
        
    }

    
    //This is triggered when text is entered into a textbox.  It enables the submit button only when all three text boxes have values entered
    //Thanks Leo Dabus https://stackoverflow.com/questions/34941069/enable-a-button-in-swift-only-if-all-text-fields-have-been-filled-out
    func editingChanged(_ textField: UITextField) {
        if textField.text?.characters.count == 1 {
            if textField.text?.characters.first == " " {
                textField.text = ""
                return
            }
        }
        guard
            let user = userTextbox.text, !user.isEmpty,
            let pass = passwordTextbox.text, !pass.isEmpty,
            let url = urlTextbox.text, !url.isEmpty
            else {
                submitButton.isEnabled = false
                return
        }
        self.statusText.text = "You may now submit your credentials!"
        submitButton.isEnabled = true
    } //end editingChanged
    
   
    
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
