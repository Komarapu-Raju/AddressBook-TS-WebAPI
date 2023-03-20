"use strict";
const APIURL = "https://localhost:7214/api/Contact/";
class Contact {
    constructor(Id, Name, Email, Mobile, Landline, Website, Address) {
        this.Id = Id;
        this.Name = Name;
        this.Email = Email;
        this.Mobile = Mobile;
        this.Landline = Landline;
        this.Website = Website;
        this.Address = Address;
    }
}
class AddressBook {
    constructor() {
        this.contactList = new Array();
    }
    getAllContacts() {
        $.ajax({
            type: 'GET',
            url: APIURL + "all",
            async: false,
            success: (response) => {
                this.contactList = response.map(function (item) {
                    return new Contact(item.id, item.name, item.email, item.mobile, item.landline, item.website, item.address);
                });
            }
        });
        return this.contactList;
    }
    addContact(contact) {
        $.ajax({
            type: 'POST',
            url: APIURL + "add",
            async: false,
            contentType: 'application/json',
            data: JSON.stringify(contact),
            success: (response) => {
                alert(response);
            }
        });
    }
    updateContact(id, updateContact) {
        $.ajax({
            type: 'PUT',
            url: APIURL + "update/" + id,
            async: false,
            data: JSON.stringify(updateContact),
            contentType: 'application/json',
            success: (response) => {
                alert(response);
            }
        });
    }
    deleteContact(id) {
        $.ajax({
            type: 'DELETE',
            url: APIURL + id,
            contentType: 'application/json',
            async: false,
            success: (response) => {
                alert(response);
            }
        });
    }
    getContactById(id) {
        var contact;
        $.ajax({
            type: 'GET',
            url: APIURL + id,
            contentType: 'application/json',
            async: false,
            success: (item) => {
                contact = new Contact(item.id, item.name, item.email, item.mobile, item.landline, item.website, item.address);
            }
        });
        return contact;
    }
}
function getHTMLElementById(id) {
    return document.getElementById(id);
}
function getHTMLInputValueById(id) {
    let inputElement = document.getElementById(id);
    return inputElement.value.trim();
}
function setHTMLInputValueById(id, value) {
    let inputElement = document.getElementById(id);
    inputElement.value = value;
}
let myAddressBook = new AddressBook();
function openAddContactForm() {
    resetForm();
    getHTMLElementById("modalBackgroundBlock").style.display = 'block';
    getHTMLElementById("contactFormContainer").style.display = 'flex';
    getHTMLElementById("btnContainer").innerHTML = `<button type="button" id="addBtn" class="add-btn" onclick="addContactToAddressbook()">Add</button>`;
}
function addContactToAddressbook() {
    if (isFormValid()) {
        let newContact = new Contact(0, getHTMLInputValueById("name"), getHTMLInputValueById("email"), getHTMLInputValueById("mobile"), getHTMLInputValueById("landline"), getHTMLInputValueById("website"), getHTMLInputValueById("address"));
        myAddressBook.addContact(newContact);
        closeAddContactForm();
        displayContactList();
        displayContactDetails((Math.max(...myAddressBook.getAllContacts().map(contact => contact.Id))));
    }
}
function closeAddContactForm() {
    resetForm();
    getHTMLElementById("contactFormContainer").style.display = 'none';
    getHTMLElementById("modalBackgroundBlock").style.display = 'none';
}
function editContactDetails(contactId) {
    let selectedContact = JSON.parse(JSON.stringify(myAddressBook.getContactById(contactId)));
    getHTMLElementById("contactFormContainer").style.display = 'flex';
    getHTMLElementById("modalBackgroundBlock").style.display = 'block';
    for (let key in selectedContact) {
        if (key != 'Id')
            setHTMLInputValueById(key.toLowerCase(), selectedContact[key]);
    }
    getHTMLElementById("btnContainer").innerHTML = (`<button type="button" id="updateBtn" class="update-btn" onclick="updateContactDetails(${contactId})">Update</button>`);
}
function updateContactDetails(contactId) {
    if (isFormValid()) {
        let newContact = new Contact(contactId, getHTMLInputValueById("name"), getHTMLInputValueById("email"), getHTMLInputValueById("mobile"), getHTMLInputValueById("landline"), getHTMLInputValueById("website"), getHTMLInputValueById("address"));
        myAddressBook.updateContact(contactId, newContact);
        getHTMLElementById("contactFormContainer").style.display = 'none';
        getHTMLElementById("btnContainer").innerHTML = '';
        getHTMLElementById("modalBackgroundBlock").style.display = 'none';
        displayContactList();
        displayContactDetails(contactId);
    }
}
function openDeleteContactModal(contactId) {
    getHTMLElementById("modalBackgroundBlock").style.display = 'block';
    getHTMLElementById("deletContactModal").style.display = 'flex';
    getHTMLElementById('deleteBtnContainer').innerHTML = `<button type="button" id="cancelBtn" onclick="closeDeleteContactModal()">Cancel</button>
                                                          <button type="button" id="deleteBtn" onclick="deleteContactFromAddressBook(${contactId})">Delete</button>`;
}
function deleteContactFromAddressBook(contactId) {
    myAddressBook.deleteContact(contactId);
    prevContactid = '';
    closeDeleteContactModal();
    displayContactList();
    goToHome();
}
function closeDeleteContactModal() {
    getHTMLElementById("deletContactModal").style.display = 'none';
    getHTMLElementById("modalBackgroundBlock").style.display = 'none';
}
function resetForm() {
    let contactForm = document.getElementById("contactForm");
    contactForm.reset();
    let fields = ['name', 'email', 'mobile'];
    fields.forEach(field => { setMandatoryFieldMessage(field, '*'); });
}
function displayContactList() {
    getHTMLElementById("contactList").innerHTML = '';
    myAddressBook.getAllContacts().forEach(data => {
        getHTMLElementById("contactList").insertAdjacentHTML("beforeend", `<div class="contact-list-item" id="${data.Id}" onclick="displayContactDetails(${data.Id})">
                                                                            <h2>${data.Name}</h2>
                                                                            <p>${data.Email}</p>
                                                                            <p>+91 ${data.Mobile}</p>
                                                                          </div>`);
    });
}
displayContactList();
function goToHome() {
    if (myAddressBook.getAllContacts().length) {
        displayContactDetails(myAddressBook.getAllContacts()[0].Id);
    }
    else {
        getHTMLElementById("contactDetailsContainer").style.display = 'none';
    }
}
goToHome();
var prevContactid;
function displayContactDetails(contactId) {
    getHTMLElementById("contactDetailsContainer").style.display = 'flex';
    getHTMLElementById("contactDetailsOptions").innerHTML = "";
    if (prevContactid) {
        getHTMLElementById(prevContactid.toString()).style.backgroundColor = "#ffffff";
    }
    let selectedContact = JSON.parse(JSON.stringify(myAddressBook.getContactById(contactId)));
    getHTMLElementById(contactId.toString()).style.backgroundColor = "#CEE7F2";
    for (let key in selectedContact) {
        if (key != 'Id') {
            getHTMLElementById("contact" + key).innerText = selectedContact[key] || 'Not available';
        }
    }
    getHTMLElementById("contactDetailsOptions").insertAdjacentHTML("beforeend", `<span id="editContact" onclick="editContactDetails(${contactId})"><img class="edit-icon" src="../images/pen.png"></i><p>Edit</p></span>
                                                                                <span id="deleteContact" onclick="openDeleteContactModal(${contactId})"><img class="delete-icon" src="../images/trash.png"><p>Delete</p></span>`);
    prevContactid = contactId.toString();
}
const EMAILREGEX = /^([a-zA-Z\d\._-]+)@([a-zA-Z\d-]+)\.([a-zA-Z]{2,8})(\.[a-zA-Z]{2,8})?$/;
const PHONEREGEX = /^(\+91)?(\ )?(\0)?([\d]{10})$/;
function setMandatoryFieldMessage(id, message) {
    getHTMLElementById(`${id}Mandatory`).innerHTML = message;
}
function validateMandatoryfield(field) {
    let fieldValue = getHTMLInputValueById(field);
    if (!(fieldValue)) {
        setMandatoryFieldMessage(field, `${`${field}`.charAt(0).toUpperCase() + `${field}`.slice(1)} is required`);
    }
    else if (field == 'email' && !EMAILREGEX.test(fieldValue)) {
        setMandatoryFieldMessage(field, 'Email is invalid');
    }
    else if (field == 'mobile' && !PHONEREGEX.test(fieldValue)) {
        setMandatoryFieldMessage(field, 'Phone is invalid');
    }
    else {
        setMandatoryFieldMessage(field, '*');
        return true;
    }
    return false;
}
function isFormValid() {
    var mandatoryFields = ['name', 'email', 'mobile'];
    let validForm = true;
    mandatoryFields.forEach(field => {
        validForm = validateMandatoryfield(field) && validForm;
    });
    return validForm;
}
