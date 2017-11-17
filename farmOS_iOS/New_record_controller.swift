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

    var credentials = Check_credentials()
    
    @IBOutlet weak var statusText: UILabel!
    
    @IBOutlet weak var userTextbox: UITextField!
    
    @IBOutlet weak var passwordTextbox: UITextField!
    
    @IBOutlet weak var submitButton: UIButton!
    
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Uncomment the following line to preserve selection between presentations
        // self.clearsSelectionOnViewWillAppear = false

        // Uncomment the following line to display an Edit button in the navigation bar for this view controller.
        // self.navigationItem.rightBarButtonItem = self.editButtonItem()
    }

    
    @IBAction func submitPressed(_ sender: Any) {
        
        credentials.farmOSusername = self.userTextbox.text!
        credentials.farmOSpassword = self.passwordTextbox.text!
        
        credentials.makeRequest() { responseObject in
            // use responseObject and error here
            
            print("***RESPONSE: \(responseObject)")
            
            if responseObject == "success" {
                
                //unwind segue
               self.performSegue(withIdentifier: "unwindToMain", sender: self)
                
            } else {
                self.statusText.text = "Invalid credentials - please re-enter"
                print("No way - your credentials are all messed up!")
            }
            
            return
        } // close credentials makeRequest
        
        
    } //close submitPressed
    
    
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
 let pass = passwordTextbox.text, !pass.isEmpty
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
