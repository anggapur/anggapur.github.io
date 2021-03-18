'use strict';

// Set Toastr
toastr.options = {
  "closeButton": false,
  "debug": false,
  "newestOnTop": false,
  "progressBar": false,
  "positionClass": "toast-bottom-center",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}

var dataItems = [];

class DataList extends React.Component {
  render () {
    if(this.props.items.length > 0) {
        var items = this.props.items.map((item, index) => {
            return (
                <DataListItem key={index} item={item} index={index} removeItem={this.props.removeItem} markTodoDone={this.props.markTodoDone} />
            );
        });      
    } else {
        var items = <tr className="text-center"><td colSpan="4">No Data</td></tr>
    }
    return (
      <table className="table table-hovered">
        <thead>
            <tr>
                <th>Person</th>
                <th>Age of Death</th>
                <th>Year of Death</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            {items}
        </tbody>
      </table> 
    );
  }
}
  
class DataListItem extends React.Component {
  constructor(props) {
    super(props);
    this.onClickClose = this.onClickClose.bind(this);    
  }
  onClickClose() {
    var index = parseInt(this.props.index);
    this.props.removeItem(index);
  }

  render () {   
    return(    
        <tr>
            <td className="text-left">
                {this.props.item.personName}
            </td>
            <td className="text-left">
                {this.props.item.ageOfDeath}
            </td>
            <td className="text-left">
                {this.props.item.yearOfDeath}
            </td>
            <td className="text-left">
                <button type="button" className="btn btn-danger btn-sm" onClick={this.onClickClose}>&times;</button>
            </td>
        </tr>
    );
  }
}

class DataForm extends React.Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }
  componentDidMount() {
    this.refs.itemName.focus();
  }
  onSubmit(event) {
    event.preventDefault();
    var newItemValue = this.refs.itemName.value;
    var ageOfDeathValue = this.refs.ageOfDeath.value;
    var yearOfDeathValue = this.refs.yearOfDeath.value;
    
    if(newItemValue) {
      this.props.addItem({newItemValue, ageOfDeathValue, yearOfDeathValue});
      this.refs.form.reset();
    }
  }
  render () {
    return (
        <form ref="form" onSubmit={this.onSubmit} className="form-inline">
            <div className="row">
            <div className="col-sm-3">
                <input type="text" ref="itemName" className="form-control" placeholder="Person Name"/>
            </div>
            <div className="col-sm-3">
                <input type="number" min="0" ref="ageOfDeath" className="form-control" placeholder="Age of Death"/>
            </div>
            <div className="col-sm-3">
                <input type="number" min="0" ref="yearOfDeath" className="form-control" placeholder="Year of Death"/>
            </div>
            <div className="col-sm-2">
                <button type="submit" className="btn btn-primary">Add</button> 
            </div>     
            </div>               
        </form>
    );   
  }
}
  
class SubmitForm extends React.Component {
    constructor(props) {
      super(props);      
    }   
    
    render() {
        var btnDisabled = this.props.items.length > 0 ? "" : "disabled";
        return (
          <div>            
            <button className="btn btn-success btn-lg" disabled={btnDisabled} onClick={this.props.onClick}>Get the Answer</button>           
            <button className="btn btn-default btn-lg ml-15" disabled={btnDisabled} onClick={this.props.onClickReset}>Reset</button>           
          </div>
        );
    }
}
  
class DataResult extends React.Component {
  constructor(props) {
    super(props);      
  }   

  render() {
    if(this.props.items.length > 0) {
        var items = this.props.items.map((item, index) => {
            return (
                <li key={index}>{item}</li>
            );
        });      
    } else {
        var items = '';
    }
    
    console.log("Answer");
    console.log(this.props);
    if(this.props.answerState == true) {
      return (
        <div className="results">
          <h3>The Answer</h3>
          <ul className="text-left">
            {items}
          </ul>
        </div>
      );
    } else {
      return (
        <div className="results">       
        </div>
      );
    }
  }
}

class MainApp extends React.Component {
  constructor (props) {
    super(props);
    this.addItem = this.addItem.bind(this);
    this.removeItem = this.removeItem.bind(this);    
    this.state = {
      dataItems: dataItems, 
      messages: [],
      isGetAnswer: false
    };
  }
  addItem(todoItem) {
        console.log(todoItem);
        dataItems.unshift({
            index: dataItems.length+1, 
            personName: todoItem.newItemValue,       
            ageOfDeath: todoItem.ageOfDeathValue,
            yearOfDeath: todoItem.yearOfDeathValue,
        });
        this.setState({dataItems: dataItems});
  }
  removeItem (itemIndex) {
    dataItems.splice(itemIndex, 1);
    this.setState({dataItems: dataItems});
  }  

  onClick = () => {
    console.log("Send Data");
    console.log(dataItems);
    var base_url = window.location.origin;
    var apiUrl = base_url+'/getAverage';        
    var  postBody = {
        data: dataItems
    };
    var requestMetadata = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postBody)
    };
    
    fetch(apiUrl, requestMetadata)
    .then(res => res.json())
    .then(response => {
      if(response.status) {
        console.log(response.message);      
        this.setState({messages:response.message,isGetAnswer:true});                 
      } else {
        console.log(response.message);
        toastr["error"](response.message)
      }        
    });
  }

  onClickReset = () => {
    console.log("Reset");
    dataItems.splice(0, dataItems.length);
    this.setState({dataItems: dataItems, messages:[], isGetAnswer: false});
  }

  render() {
    return (
        <div id="main">      
            <div className="col-sm-8 col-sm-push-2 text-center">
                <DataForm addItem={this.addItem} />
                <DataList items={this.props.initItems} removeItem={this.removeItem}/>        
                <SubmitForm onClick={this.onClick}  onClickReset={this.onClickReset} items={this.state.dataItems}/>

                <DataResult items={this.state.messages} answerState={this.state.isGetAnswer}/>
            </div>
        </div>
    );
  }
}

ReactDOM.render(<MainApp initItems={dataItems}/>, document.getElementById('app'));