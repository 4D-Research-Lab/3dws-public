import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Card from 'react-bootstrap/Card'
import React, { useState, useEffect } from 'react';
import firebase from "../firebase"
import "firebase/compat/firestore"
import { updateDoc, arrayUnion, doc } from "firebase/firestore";
import { useAuth } from "../libs/context";
import Pagination from 'react-bootstrap/Pagination';
import { IoMdAdd } from 'react-icons/io';


export async function getServerSideProps() {

    const response = await fetch('https://voyager-data.create.humanities.uva.nl/').then(function (res) {
        return res.text()
    })

    return {
        props: {
            html: response
        }
    }
}

export default function Models({ html }) {
    const page_size = 6;
    const [data, setData] = useState([])
    const [modelData, setModelData] = useState([])
    const [categoryData, setCategoryData] = useState([])
    const [value, setValue] = useState(" ");
    const [show, setShow] = useState(false);
    const [inputValue, setInputValue] = useState("");


    const handleClose = () => setShow(false);
    const handleShow = (model) => {
        setShow(true)
        setCurrentModel(model)
    }
    const [active, setActive] = useState(1);
    const [items, setItems] = useState(1);
    function paginate(array, page_number) {
        // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }
    const { displayName } = useAuth();

	var btns = document.getElementsByClassName("page-item");

	// Loop through the buttons and add the active class to the current/clicked button
	for (var i = 0; i < btns.length; i++) {
  	btns[i].addEventListener("click", function() {
    	var current = document.getElementsByClassName("active");
    	current[0].className = current[0].className.replace(" active", "");
    	this.className += " active";
  	});
	}

    const handlePageination = (number) => {
		//setActive needs to use useEffect instead of async state
		//https://stackoverflow.com/questions/54069253/the-usestate-set-method-is-not-reflecting-a-change-immediately
        setActive(number);


		active=number;
		showCurrentPageModels();
        setModelData(paginate(modelData, active))
    }



    const handleChange = e => 
    {
        var input, filter, ul, li, a, i, txtValue;
  	input = document.getElementById('myInput');
  	filter = e.target.value.toUpperCase();
  	li = document.getElementsByClassName('col-md-4');

  	// Loop through all list items, and hide those who don't match the search query
  	for (i = 0; i < li.length; i++) 
	{
    	a = li[i].getElementsByClassName('card-title')[0];
   	txtValue = a.textContent || a.innerText;
    	if (txtValue.toUpperCase().indexOf(filter) > -1) 
	{
      		li[i].style.display = "";
    	} 
	else 
	{
      		li[i].style.display = "none";
    	}
  }
};
const inputReset = () => {
    setInputValue("")
};


    async function addModelToCollection() {
        const db = firebase.firestore();
        const collection = doc(db, "collections", currentCollectionID);
        await updateDoc(collection, {
            models: arrayUnion(currentModel)
        });
    }

    const [currentCollectionID, setCurrentCollectionID] = useState("");
    const updateCollection = (id) => {
        setCurrentCollectionID(id)
    }

    const [currentModel, setCurrentModel] = useState("");

    const handleSubmit = (e) => {
        if (currentCollectionID === "") {
            handleClose()
        }
        else {
            e.preventDefault();
            const form = e.currentTarget;
            if (form.checkValidity() === false) {
                e.preventDefault();
                e.stopPropagation();
            }
            handleClose()
            addModelToCollection()
        }
    };

    // Get models
    useEffect(() => {
        if (html) {
      	localStorage.clear();
            fetchData()
        }
    }, [])
	const models=[];
        const getModel = async (model) => {
			//check if model exists on page already
			var test = document.getElementById(model)
			if (test === null){
					if (model) {
						const json = {}
						json = await fetch('https://voyager-data.create.humanities.uva.nl/' + model).then(function (response) {
							// When the page is loaded convert it to text
							return response.json()
						}).catch(function (err) {
							console.log('Failed to fetch page: ', err);
						});

						if (json) {
							Object.assign(json, { path: model });

							setModelData(modelData => [...modelData, json],active)
							setData(data => [...data, json])
						}
					}
            }
        }
	const showCurrentPageModels = () => {

		var goo = page_size*(active-1);
		for (var i = goo; i< goo+page_size; i+=1){
			getModel(models[i]);
		}

	}

    const fetchModels = () => {
        var doc = document.createElement("html");
        doc.innerHTML = html;
        var links = doc.getElementsByTagName("a")
        var urls = [];

        for (var i = 0; i < links.length; i++) {
            urls.push(links[i].getAttribute("href"));
        }
        models = urls.filter(name => name.includes('.svx.json'))
        setItems([])
        for (let number = 1; number <= Math.ceil(models.length / 6); number++) {
            setItems(items => [...items,
            <Pagination.Item onClick={() => { handlePageination(number); inputReset(); }} key={number} active={number === active}>
                {number}
            </Pagination.Item>
            ])
        }
	showCurrentPageModels();
        setModelData(paginate(modelData, active))
    }
    const fetchData = () => {
        if(false){
		var doc = document.createElement("html");
		doc.innerHTML = html;
		var links = doc.getElementsByTagName("a")
		var urls = [];

		for (var i = 0; i < links.length; i++) {
		    urls.push(links[i].getAttribute("href"));
		}
		let models = urls.filter(name => name.includes('.svx.json'))
	}
	fetchModels();
        setModelData(paginate(modelData, active))
    };


    //Get collection info
    useEffect(() => {
        const db = firebase.firestore();
        db.collection("collections")
            .get()
            .then((snapshot) => {
                const list = []
                snapshot.forEach((doc, i) => {
                    const obj = doc.data()
                    Object.assign(obj, { id: doc.id });
                    list.push(obj)

                });
                setCategoryData(list)
            })
            .catch((error) => {
                console.log("Error getting documents: ", error);
            });
    }, [])

    return (
        <Row>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add model to collection</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Select onChange={e => updateCollection(e.target.value)} className="spacing">
                            <option >select a collection</option>
                            {categoryData.map(item => (
                                <option key={item.id} value={item.id}>{item.title}</option>
                            ))}
                        </Form.Select>
                        <Button onClick={handleSubmit}> Submit</Button>
                    </Form>
                </Modal.Body>

            </Modal>
            <Col md={{ span: 9, offset: 2 }}>
                <div>
                    <h1>Models </h1>
                    <Row>
                        <Col sm={3}>
                            <div className='spacing'>
                            </div>
                            <div className='spacing'></div>
                            <div>
                                <div className='spacing'>
                                    <label>
                                        Search Models
                                        <div className=' small'>
                                            <i>Search through titles</i>
                                        </div>
                                        <input type="search" 
                                        name="name" 
                                        id="MyInput" 
                                         onKeyUp={handleChange.bind(this)} placeholder="Search for model ID.." 
                                         value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                                         />
                                        <div className='spacing'>
                                        </div>

                                    </label>


                                </div>

                                <div >Search Page</div>
                                <div className='pagination'>
                                    <Pagination size="sm">{items}</Pagination>
                                </div>
                            </div>
                        </Col>
                        <Col sm={9}>

                            <Row>
                                {
                                    modelData.map(model => (
                                        < Col md={4} key={model.path}>
                                            <Card className='spacing' >
                                                <div className="model-explorer-wrapper" >
                                                    <voyager-explorer id="voyager3" uimode="None" root="https://voyager-data.create.humanities.uva.nl/" document={model.path}></voyager-explorer>
                                                </div>
                                                <Card.Body>
                                                    <Card.Title>
                                                        {model.title != undefined ? model.title : model.path.replace(".svx.json", "")}
                                                        {displayName && <span className='pull-right'>
                                                            <Button onClick={() => { handleShow(model.path) }} className="add-button" size="sm"><IoMdAdd /></Button>
                                                        </span>}
                                                    </Card.Title>
                                                    {model.creator != undefined &&
                                                        <Card.Subtitle className="mb-2 text-muted">
                                                            model.creator
                                                        </Card.Subtitle>
                                                    }
                                                    {model.description != undefined &&
                                                        <Card.Text>
                                                            Description
                                                        </Card.Text>
                                                    }
                                                    <Card.Text>
                                                        <Button variant="secondary" href={'/explorer.html?root=https://voyager-data.create.humanities.uva.nl/&document=' + model.path}> View           </Button>
                                                    </Card.Text>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                            </Row>
                        </Col>
                    </Row>
                </div >
            </Col >
        </Row >
    )
}
