const books = [];
const RENDER_BOOKS = "render-books";
const SAVED_EVENT = "saved-event";
const STORAGE_KEY = "bookshelf-apps";
let changes = {};

document.addEventListener("DOMContentLoaded", () => {
    const inputBookForm = document.getElementById("inputBook");
    inputBookForm.addEventListener("submit", (event) => {
        event.preventDefault();
        inputBook();
    });

    const searchBookForm = document.getElementById("searchBook");
    searchBookForm.addEventListener("submit", (event) => {
        event.preventDefault();
        document.dispatchEvent(new Event(RENDER_BOOKS));
    });

    const checkbox = document.getElementById("inputBookIsComplete");
    checkbox.addEventListener("change", (event) => {
        const submitStatus = document.getElementById("submitStatus");
        if(checkbox.checked){
            submitStatus.innerText = "Selesai dibaca";
        }else{
            submitStatus.innerText = "Belum selesai dibaca";
        }
    });

    if (isStorageExist()) loadData();
});

// TODO 1: Menambahkan Data Buku
const inputBook = () => {
    const title = document.getElementById("inputBookTitle").value;
    const author = document.getElementById("inputBookAuthor").value;
    const year = document.getElementById("inputBookYear").value;
    const isComplete = document.getElementById("inputBookIsComplete").checked;

    const id = createID();
    const bookObject = createBookObject(id, title, author, year, isComplete);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_BOOKS));
    changes = {
        type: "success",
        title: "Berhasil",
        message: "Buku Tersimpan",
        timer: 4000,
    };
    saveData();
};

const createID = () => {
    return +new Date();
};

const createBookObject = (id, title, author, year, isComplete) => {
    return {
        id,
        title,
        author,
        year,
        isComplete,
    };
};

document.addEventListener(RENDER_BOOKS, () => {
    const incompleteBookshelf = document.getElementById(
        "incompleteBookshelfList"
    );
    incompleteBookshelf.innerHTML = "";

    const completeBookshelf = document.getElementById("completeBookshelfList");
    completeBookshelf.innerHTML = "";

    const displayedBooks = searchBook();

    for (const bookObject of displayedBooks) {
        const bookElement = createBookElement(bookObject);
        if (bookObject.isComplete) {
            completeBookshelf.append(bookElement);
        } else {
            incompleteBookshelf.append(bookElement);
        }
    }
});

const createBookElement = (bookObject) => {
    const title = document.createElement("h3");
    title.innerText = bookObject.title;

    const author = document.createElement("p");
    author.innerText = `Penulis: ${bookObject.author}`;

    const year = document.createElement("p");
    year.innerText = `Tahun: ${bookObject.year}`;

    const actionContainer = document.createElement("div");
    actionContainer.classList.add("action");

    const completeButton = document.createElement("button");
    completeButton.classList.add("green");

    if (!bookObject.isComplete) {
        completeButton.innerText = "Selesai dibaca";
        completeButton.addEventListener("click", () => {
            markBookCompleted(bookObject.id);
        });
    } else {
        completeButton.innerText = "Belum selesai dibaca";
        completeButton.addEventListener("click", () => {
            markBookIncomplete(bookObject.id);
        });
    }

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("red");
    deleteButton.innerText = "Hapus buku";
    deleteButton.addEventListener("click", () => {
        deleteBook(bookObject.id);
    });

    actionContainer.append(completeButton, deleteButton);

    const bookContainer = document.createElement("article");
    bookContainer.classList.add("book_item");
    bookContainer.setAttribute("id", `book-${bookObject.id}`);

    bookContainer.append(title, author, year, actionContainer);

    return bookContainer;
};

// TODO 2: Dapat Memindahkan Buku Antar Rak
const markBookCompleted = (bookId) => {
    const bookObject = books.find((book) => book.id === bookId);
    bookObject.isComplete = true;
    document.dispatchEvent(new Event(RENDER_BOOKS));
    changes = {
        type: "info",
        title: bookObject.title,
        message: "Telah selesai dibaca",
        timer: 4000,
    };
    saveData();
};

const markBookIncomplete = (bookId) => {
    const bookObject = books.find((book) => book.id === bookId);
    bookObject.isComplete = false;
    document.dispatchEvent(new Event(RENDER_BOOKS));
    changes = {
        type: "info",
        title: bookObject.title,
        message: "Belum selesai dibaca",
        timer: 4000,
    };
    saveData();
};

// TODO 3: Dapat Menghapus Data Buku
const deleteBook = (bookId) => {
    const bookIndex = books.findIndex((book) => book.id === bookId);
    const bookObject = books[bookIndex];

    // TODO (Opsional) : improvisasi (Dialog Menghapus Buku)
    cuteAlert({
        type: "question",
        title: "Hapus Data Buku",
        message: `Hapus Buku ${bookObject.title}?`,
        confirmText: "Okay",
        cancelText: "Cancel",
    }).then((e) => {
        if (e == "confirm") {
            books.splice(bookIndex, 1);
            document.dispatchEvent(new Event(RENDER_BOOKS));
            changes = {
                type: "error",
                title: bookObject.title,
                message: 'Data buku dihapus',
                timer: 4000
            }
            saveData();
        }
    });
};

// TODO 4: Memanfaatkan localStorage dalam Menyimpan Buku
const isStorageExist = () => {
    return typeof Storage !== "undefined";
};

const saveData = () => {
    if (isStorageExist()) {
        const parsedData = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsedData);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
};

const loadData = () => {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    const data = JSON.parse(serializedData);
    if (data != null) {
        for (const book of data) {
            books.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_BOOKS));
};

document.addEventListener(SAVED_EVENT, () => {
    cuteToast(changes);
});

const searchBook = () => {
    const searchKey = document.getElementById("searchBookTitle").value;
    const lowerCaseSearchKey = searchKey.toLowerCase();
    const matchingBooks = [];
    for (const book of books) {
        const lowerCaseTitle = book.title.toLowerCase();
        if (lowerCaseTitle.includes(lowerCaseSearchKey)) {
            matchingBooks.push(book);
        }
    }
    return matchingBooks;
};
