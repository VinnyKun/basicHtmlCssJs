// temp store of intvervals. Requires  cleanup.
var intervals = []

// set displays for tabs and starts interval for booking tab to clear form
function switchTab(tabName) {
    var i;
    var x = document.getElementsByClassName("tab");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    document.getElementById(tabName).style.display = "block";
    displayBookingDetailsInTableAndHeaders()

    // clear any existing intervals when switching to other tabs
    intervals.forEach(clearInterval);

    // only set interval to alert user when "Book" tab
    if (tabName === "Book") {
        function confirmPopup() {
            var confirm = window.confirm("Click on Okay to continue session or Cancel to clear any existing fields")
            if(!confirm) {
                // clear form when user clicks cancel
                document.getElementById("bookingForm").reset();
            }
            // we use this hack to prevent backlog of confirm popups
            switchTab(tabName)
        }
        var bookTabInterval = setInterval(confirmPopup, 60000)
        intervals.push(bookTabInterval);
    }
}

// utility method get all currentBooking details. can return null or empty object
function getBookingDetails() {
    var bookingList = JSON.parse(localStorage.getItem("bookingMap10"));
    return bookingList;
}

// function to display the table and correct headers regarding the remaining slots
function displayBookingDetailsInTableAndHeaders() {
    // Get current booking details from local storage
    var currentBookingMap = getBookingDetails();

    // Grab the header tag to display remaining slots
    var remainingSlotsHeaders = document.querySelectorAll('.remainingSlots')

    // Display table if records exists
    // else just display message saying All slots are available
    if (currentBookingMap && Object.keys(currentBookingMap).length) {
        var tableHeader =     
            `
            <tr>
                <th> Serial No. </th>
                <th> Name </th>
                <th> Phone number  </th>
                <th> Timestamp </th>
            </tr>
            `;
        var thead = document.querySelector('#table-head');
        thead.innerHTML = tableHeader;

        var tableData = Object.values(currentBookingMap).map(booking => (
            `
            <tr>
                <td>${booking.serialNumber}</td>
                <td>${booking.name}</td>
                <td>${booking.phoneNumber}</td>
                <td>${booking.timeStamp}</td>
            </tr>
            `
        )).join('');
        var tbody = document.querySelector('#table-body');
        tbody.innerHTML = tableData;

        remainingSlotsHeaders.forEach(header => {
            header.innerHTML = `Remaining available booking slots: ${10 - Object.keys(currentBookingMap).length}`
        })
    } else {
        remainingSlotsHeaders.forEach(header => {
            header.innerHTML = 'No current Bookings. All slots are available: 10'
        })
    }
}

// utility method to generate unique ids using timestamps. written in es6 and can be rewritten
const uniqueId = (length=16) => {
    return parseInt(Math.ceil(Math.random() * Date.now()).toPrecision(length).toString().replace(".", ""))
}

// function to save booking details to local storage
function saveBookingDetails(formInstance) {
    // details from form and create booking details object
    var name =  formInstance.name.value;
    var phoneNumber = formInstance.phoneNumber.value;
    var timeStamp = new Date();
    var serialNumber = uniqueId();
    var bookingDetails = {
        serialNumber,
        name,
        phoneNumber,
        timeStamp
    }

    // get current booking details from local storage
    var currentBookingMap = getBookingDetails();

    // check if currentBookingMap exist in local storage else create it
    // if exist check if limit of 10 is reached. Reached then display or alert negative news
    // else we add it to existing map. Reached then display or alert positive news
    if(currentBookingMap && Object.keys(currentBookingMap).length) {
        var currentBookingKeyListLen = Object.keys(currentBookingMap).length;
        if (currentBookingKeyListLen < 10 ) {
            localStorage.setItem("bookingMap10",JSON.stringify({...currentBookingMap, [serialNumber]: bookingDetails}))        
            alert(`Sucessfully added. Total current Records: ${currentBookingKeyListLen + 1}`)
        } else {
            alert("Error: Limit of Bookings Reached")
        }
    } else {
        localStorage.setItem("bookingMap10",JSON.stringify({
            [serialNumber]: bookingDetails
        }))
        alert(`Sucessfully added. Total current Records: 1`)
    }
}

// function to delete individual records from local storage
function cancelIndividualBooking(formInstance){
    var serialNumber = formInstance.serialNumber.value;
    var bookingKey = parseInt(serialNumber)
    // Get current booking details from local storage
    var currentBookingMap = getBookingDetails();

    if(currentBookingMap && Object.keys(currentBookingMap).length) {
        var bookingDetails = currentBookingMap[bookingKey]
        if (bookingDetails) {
            var bookingMapCopy = {...currentBookingMap}
            delete bookingMapCopy[bookingKey]
            localStorage.setItem("bookingMap10",JSON.stringify(bookingMapCopy))        
            alert(`Sucessfully removed record with serial number: ${serialNumber}`)
        } else {
            alert(`Error: No Booking Record Present with id ${serialNumber}`)
        }       
    } else {
        alert(`Error: No Records Present`)
    }
}