const APIURL = "https://localhost:7214/api/Contact/";

class Contact {
    constructor(
        public Id: number,
        public Name: string,
        public Email: string,
        public Mobile: string,
        public Landline: string,
        public Website: string,
        public Address: string
    ) { }
}

class AddressBook {
    private contactList: Array<Contact>;

    constructor() {
        this.contactList = new Array<Contact>();
    }

    getAllContacts() {
        $.ajax({
            type: 'GET',
            url: APIURL + "all",
            async: false,
            success: (response) => {
                this.contactList = response.map(function (item: { id: number; name: string; email: string; mobile: string; landline: string; website: string; address: string }) {
                    return new Contact(item.id, item.name, item.email, item.mobile, item.landline, item.website, item.address)
                });
            }
        })
        return this.contactList;
    }

    addContact(contact: Contact) {
        $.ajax({
            type: 'POST',
            url: APIURL + "add",
            async: false,
            contentType: 'application/json',
            data: JSON.stringify(contact),
            success: (response) => {
                alert(response);
            }
        })
    }

    updateContact(id: number, updateContact: Contact) {
        $.ajax({
            type: 'PUT',
            url: APIURL + "update/"+id,
            async: false,
            data: JSON.stringify(updateContact),
            contentType: 'application/json',
            success: (response) => {
                alert(response);
            }
        })
    }

    deleteContact(id: number) {
        $.ajax({
            type: 'DELETE',
            url: APIURL + id,
            contentType: 'application/json',
            async: false,
            success: (response) => {
                alert(response);
            }
        })
    }

    getContactById(id: number): Contact {
        var contact;
        $.ajax({
            type: 'GET',
            url: APIURL + id,
            contentType: 'application/json',
            async: false,
            success: (item) => {
                contact = new Contact(item.id, item.name, item.email, item.mobile, item.landline, item.website, item.address)
            }
        })
        return (contact as unknown) as Contact;
    }
}

function getHTMLElementById(id: string): HTMLElement {
    return <HTMLElement>document.getElementById(id);
}

function getHTMLInputValueById(id: string): string {
    let inputElement = <HTMLInputElement>document.getElementById(id);
    return inputElement.value.trim();
}

function setHTMLInputValueById(id: string, value: string) {
    let inputElement = <HTMLInputElement>document.getElementById(id);
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
        let newContact = new Contact(0, getHTMLInputValueById("name"),
            getHTMLInputValueById("email"),
            getHTMLInputValueById("mobile"),
            getHTMLInputValueById("landline"),
            getHTMLInputValueById("website"),
            getHTMLInputValueById("address"));
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

function editContactDetails(contactId: number) {
    let selectedContact = JSON.parse(JSON.stringify(myAddressBook.getContactById(contactId)));
    getHTMLElementById("contactFormContainer").style.display = 'flex';
    getHTMLElementById("modalBackgroundBlock").style.display = 'block';
    for (let key in selectedContact) {
        if (key != 'Id')
            setHTMLInputValueById(key.toLowerCase(), selectedContact[key]);
    }
    getHTMLElementById("btnContainer").innerHTML = (`<button type="button" id="updateBtn" class="update-btn" onclick="updateContactDetails(${contactId})">Update</button>`);
}

function updateContactDetails(contactId: number) {
    if (isFormValid()) {
        let newContact = new Contact(contactId, getHTMLInputValueById("name"),
            getHTMLInputValueById("email"),
            getHTMLInputValueById("mobile"),
            getHTMLInputValueById("landline"),
            getHTMLInputValueById("website"),
            getHTMLInputValueById("address"));
        myAddressBook.updateContact(contactId, newContact);
        getHTMLElementById("contactFormContainer").style.display = 'none';
        getHTMLElementById("btnContainer").innerHTML = '';
        getHTMLElementById("modalBackgroundBlock").style.display = 'none';
        displayContactList();
        displayContactDetails(contactId);
    }
}

function openDeleteContactModal(contactId: number) {
    getHTMLElementById("modalBackgroundBlock").style.display = 'block';
    getHTMLElementById("deletContactModal").style.display = 'flex'
    getHTMLElementById('deleteBtnContainer').innerHTML = `<button type="button" id="cancelBtn" onclick="closeDeleteContactModal()">Cancel</button>
                                                          <button type="button" id="deleteBtn" onclick="deleteContactFromAddressBook(${contactId})">Delete</button>`
}

function deleteContactFromAddressBook(contactId: number) {
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
    let contactForm = <HTMLFormElement>document.getElementById("contactForm");
    contactForm.reset();
    let fields = ['name', 'email', 'mobile']
    fields.forEach(field => { setMandatoryFieldMessage(field, '*') })
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
    } else {
        getHTMLElementById("contactDetailsContainer").style.display = 'none';
    }
}

goToHome();

var prevContactid: string;

function displayContactDetails(contactId: number) {
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

function setMandatoryFieldMessage(id: string, message: string) {
    getHTMLElementById(`${id}Mandatory`).innerHTML = message;
}

function validateMandatoryfield(field: string): boolean {
    let fieldValue = getHTMLInputValueById(field);
    if (!(fieldValue)) {
        setMandatoryFieldMessage(field, `${`${field}`.charAt(0).toUpperCase() + `${field}`.slice(1)} is required`);
    } else if (field == 'email' && !EMAILREGEX.test(fieldValue)) {
        setMandatoryFieldMessage(field, 'Email is invalid');
    } else if (field == 'mobile' && !PHONEREGEX.test(fieldValue)) {
        setMandatoryFieldMessage(field, 'Phone is invalid');
    } else {
        setMandatoryFieldMessage(field, '*');
        return true;
    }
    return false;
}

function isFormValid(): boolean {
    var mandatoryFields = ['name', 'email', 'mobile'];
    let validForm = true;
    mandatoryFields.forEach(field => {
        validForm = validateMandatoryfield(field) && validForm;
    });
    return validForm;
}

