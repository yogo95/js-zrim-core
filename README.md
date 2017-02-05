## Synopsis

This module contains some generic managers to abstract some access like access to mongodb, or just start to
 create a controller with dependencies.

Each manager has a state that can tell you if it's ready. It also emit signal to tell what's append to it.

## Public

### BaseObject

BaseObject is a generic function that can be use with prototype 
 inheritance to include states in your object.
 
### InitializableObject

Generic object that can be initialized.

### ConnectableObject

ConnectableObject is a generic object that expose new states and signal. 
 It can be use in manager that expose a connection state like a Dal (MongoDB, Cassandra, etc.).

### ProxyLogger

Easy way to always have a logger defined. You can add a prefix name.
All BaseObject contains an internal logger.

## Exceptions

The module expose some generic exceptions.

### IllegalStateException

``
var IllegalStateException = require('js-zrim-core').exceptions.IllegalStateException;
``

## Code Example

### Using BaseObject

Require the BaseObject
```
var BaseObject = require('js-zrim-core').BaseObject;

// Use base object

```

Inheritance of the BaseObject

```
function BaseObjecExtented() {

}
BaseObject._applyPrototypeTo(BaseObjecExtented);

// Add you code here

```

You can also specified additional signals and states
```
function BaseObjecExtented() {

}
BaseObject._applyPrototypeTo(BaseObjecExtented, {
    signals: {
        newSignal: 'signalName'
    },
    states: {
        myNewState: 'StateName'
    }
});


BaseObjecExtented.prototype.myFunction = function () {
    this.emit(BaseObjecExtented.Signals.newSignal);
    this.currentState = BaseObject.States.myNewState;
};

```

Access the internal properties

```
function BaseObjecExtented() {

}
BaseObject._applyPrototypeTo(BaseObjecExtented);


BaseObjecExtented.prototype.myFunction = function () {
    this.properties.myProperty;
};

```

#### Define property

You can dynamically define a new property. By using this, it will send signal when the value
has been changed.

Use the function **_defineProperty**(**Constructor**, **Property name**, **Options**).

By using this function you can create read only property or just writable property 
or read+write property.

```
function BaseObjecExtented() {

}
BaseObject._applyPrototypeTo(BaseObjecExtented);


BaseObjecExtented._defineProperty(BaseObjecExtented, 'propA', {
    enumerable: true,
    set: function (value) {
        if (value === this.properties.propA) {
            return false; // The signal won't be emitted 
        } else if (typeof value === 'string') {
            this.properties.propA = value;
            return true; // Tells the value has been changed
        }
        
        // Returns nothing tells the value has not been changed
    },
    get: function () {
        return this.properties.propA;
    }
});

// ....

var a = new BaseObjecExtented();


a.propA = "a"; // Signal propAChanged emitted & propertyChanged emitted too
console.log(a.propA); // Print a
a.propA = 12;
console.log(a.propA); // Print a

```

It is possible to know when a property has been changed by listening the event **propertyChanged**
or the **property name** + **Changed**.

The signal **propertyChanged** will have 3 arguments : (**property name**, **new value**, **previous value**).

The second signal specialise will have 2 arguments : (**new value**, **previous value**).

**Warning**, In case of no getter exists, the previous value will be **undefined**.

### Using InitializableObject


Handling the initialization and finalization

```
function BaseObjecExtented() {

}
BaseObject._applyPrototypeTo(BaseObjecExtented);

BaseObjecExtented.prototype._handleInitialization(options, callback) {
    // Do your initialization
    return callback();
}

BaseObjecExtented.prototype._handleFinalization(options, callback) {
    // Do your finalization
    return callback();
}
```

Handling the initialization and finalization with inheritance

```
function BaseObjecExtented() {

}
BaseObject._applyPrototypeTo(BaseObjecExtented);

BaseObjecExtented.prototype._handleInitialization(options, callback) {
    var _this = this;
    BaseObject.prototype._handleInitialization.call(this, options, function (error) {
        if (error) {
            _this.logger.error("[%s][Error] %s", "_handleInitialization", error.toString(), error);
            return callback(error);
        }
        // Do your initialization
        // ...
        return callback();
    });
}

BaseObjecExtented.prototype._handleFinalization(options, callback) {
    var _this = this;
    
    // Do you finalization
    // ...
    
    // Then call the parent
    BaseObject.prototype._handleFinalization.call(this, options, function (error) {
        if (error) {
            _this.logger.error("[%s][Error] %s", "_handleFinalization", error.toString(), error);
            return callback(error);
        }
        return callback();
    });
}
```

Using the logger

```
BaseObjecExtented.prototype._handleInitialization(options, callback) {
    // ...
    this.logger.debug("Use %s", "me"); // Will log : [BaseObjecExtented] Use me
    // ...
}
```

#### Define property

You can define a property that will emit automatically signals:
- propertyChanged : (propertyName, newValue, previousValue)
- \<propertyName> + 'Changed' : (newValue, previousValue)

You can define a read only property by not specify a set method.

```
BaseObject._defineProperty(constructor, publicName, options);
```

- constructor (Function) : The constructor that will receive the property.
- publicName (String) : The property name to define
- options (Object) : Contains the definition

**Options:**
- set (Function) : The setter. You can use **this** inside to get the assign object ;
- get (Function) : The getter. You can use **this** inside to get the assign object ;
- enumerable (Boolean=false) : Same as Object.defineProperty. Default is 'false'
- configurable (Boolean=false) : Same as Object.defineProperty. Default is 'false'

**Setter**

You need to return true if you'd like to emit signals. By using this feature, you can 
change the behaviour of the setter, by ignoring the new value if it's equal to the current one.

In case of exception, the error will be log and propagate.

**Other**

If you do not specify the setter, the property will be read only.
If you do not specify the getter, the property will always return *undefined*. 
This can cause signals to not return the previous value.

**Example**
```
function MyConstructor() {
    BaseObject.apply(this, arguments);
    this.properties._a = 9999;
}
BaseObject._applyPrototypeTo(MyConstructor);

BaseObject._defineProperty(MyConstructor, 'a', {
    set: function(a) {
        if (this.properties._a === a) {
            return false;
        }
        
        this.properties._a = a;
        return true;
    },
    get: function() {
        return this.properties._a;
    }
});

var x = new MyConstructor();

x.on('propertyChanged', function(name, newValue, previousValue) {
    console.log("Property '", name, "' newValue='", newValue, "' previousValue='", previousValue, "'");
});
x.on('aChanged', function(newValue, previousValue) {
    console.log("a changed with newValue='", newValue, "' previousValue='", previousValue, "'");
});
x.a = 45;
console.log("a=", x.a);
x.a = 45;
console.log("a=", x.a);

// Output
// Property 'a' newValue='45' previousValue='9999'
// a changed with newValue='45' previousValue='9999'
// a=45
// a=45
```

### ConnectableObject

Handling the connection and disconnection

```
function ConnectableObjecExtented() {

}
ConnectableObject._applyPrototypeTo(ConnectableObjecExtented);

ConnectableObjecExtented.prototype._handleConnection(options, callback) {
    // Do your connection
    return callback();
}

ConnectableObjecExtented.prototype._handleDisconnection(options, callback) {
    // Do your disconnection
    return callback();
}
```

Using finalization will always call **disconnect** when the state is **Ready**. To change the behaviour 
override the function **_handleFinalization**.



## Installation

Production
```
npm install --production js-zrim-core
```

Build or Development
```
npm install js-zrim-core
```


## Tests

To run the test you need to install in development mode.

```
npm test
```

## License

Zrim-Everything - yogo95 - CeCILL v2
