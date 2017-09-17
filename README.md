# Synopsis

This module contains some generic managers to abstract some access like access to mongodb, or just start to
 create a controller with dependencies.

Each manager has a state that can tell you if it's ready. It also emit signal to tell what's append to it.

# Available base classes

The module provide those base classes:
- BaseObject
- InitializableObject
- ConnectableObject
- LoadableObject
- RunnableObject

# Classes

## BaseObject

BaseObject is a generic function that can be use with prototype 
 inheritance to include states in your object.
 
## InitializableObject

Generic object that can be initialized.

### States

The class adds 4 new states:
- NotInitialized : The current state when you create the object
- Initializing : The object is currently under initialization
- Initialized : The initialization succeed
- Finalizing : The object is currently under finalization

Be aware that the class do not pass to Ready after the initialization succeed.

### Signals

The class adds 6 signals:
- initializing : An initialization started
- initializationSucceed : The initialization succeed
- initializationFailed : The initialization failed
- finalizing : A finalization started
- finalizationSucceed : The finalization succeed
- finalizationFailed : The finalization failed

## SimpleInitializableObject

Same class as *InitializableObject* but after the initialization succeed, the object pass from
state *Initialized* to *Ready*.

## ConnectableObject

ConnectableObject is a generic object that expose new states and signal. 
 It can be use in manager that expose a connection state like a Dal (MongoDB, Cassandra, etc.).
 
### States

The class adds 2 new states:
- Connecting : The object is currently trying to connect
- Disconnecting : The object is currently trying to disconnect

### Signals

The class adds 8 signals:
- connecting : The object start connecting
- connectionFailed : The connection failed
- connected : The connection succeed
- connectionLost : The object lost the connection
- reconnected : The object reconnected
- disconnecting : The object start disconnecting
- disconnectionFailed : The disconnection failed
- disconnected : The disconnection succeed

## LoadableObject

This class provide a way to enable load functionality. The class provide the functions *load*
and *unLoad*. This base class can be use for configuration, context (loading a configuration or a context).

### States

The class adds 2 new states:
- Loading : The object is currently loading data
- UnLoading : The object is currently unloading data

### Signals

The class adds 6 signals:
- loading : The object start loading data
- loadFailed : The load failed
- loaded : The object load data with success
- unLoading : The object start unloading data
- unLoadFailed : The unload failed
- unLoaded : The object unload data with success

## ProxyLogger

Easy way to always have a logger defined. You can add a prefix name.
All BaseObject contains an internal logger.

# Default logger

You have 2 way to define a default logger in you system. 
You can use the **defaultLogger** logger function:
```javascript
const defaultLogger = require('js-zrim-core').defaultLogger;
defaultLogger.setDefaultLogger(null, myLogger);
```

This function only works for the same version of the package.
Another solution is to define a global default logger manager.

You must define the default logger manager using :
```javascript
if (!global.jsZrimCore) {
  global.jsZrimCore = {};
}
global.jsZrimCore.defaultLoggerManager = myDefaultLoggerManager;
```
This should be the first thing your application is doing.

## Requirement

The logger manager must define a function name getVersion which returns the
implementation version. This may help the module to know how to use the manager.

## Version 1

The version 1 requires:<br/>
- string getVersion() : returns "1.m.p" with m you minor version and p your patch version.
- string[] listLoggerNames() : This function returns the list of know logger names
- Logger getLogger(string|null|undefined) : This function returns the logger 
- string[] listLoggerNames() : List the logger names known or available
to use with the given name. In case the name is null or undefined, the function
must return the default logger.
- void setLogger(string|null|undefined, Logger) : This function define
a logger for the given name

# Exceptions

The module expose some generic exceptions.

## IllegalStateException

``
var IllegalStateException = require('js-zrim-core').exceptions.IllegalStateException;
``

# Code Example

## Using BaseObject

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

### Define property

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

## Using InitializableObject


Handling the initialization and finalization

```
function BaseObjecExtented() {

}
BaseObject._applyPrototypeTo(BaseObjecExtented);

BaseObjecExtented.prototype._handleInitialization(options) {
    return new Promise((resolve, reject) => {
        // Do your initialization
        resolve();
    });
}

BaseObjecExtented.prototype._handleFinalization(options) {
    return new Promise((resolve, reject) => {
        // Do your finalization
        resolve();
    });
}
```

Handling the initialization and finalization with inheritance

```
function BaseObjecExtented() {

}
BaseObject._applyPrototypeTo(BaseObjecExtented);

BaseObjecExtented.prototype._handleInitialization(options) {
    return BaseObject.prototype._handleInitialization.call(this, options)
        .then(() => {
            return new Promise((resolve, reject) => {
                // Your initialization
                resolve();
            });
        });
};

BaseObjecExtented.prototype._handleFinalization(options) {
    return BaseObject.prototype._handleFinalization.call(this, options)
        .then(() => {
            return new Promise((resolve, reject) => {
                // Your finalization
                resolve();
            });
        });
}
```

Using the logger

```
BaseObjecExtented.prototype._handleInitialization(options) {
    // ...
    this.logger.debug("Use %s", "me"); // Will log : [BaseObjecExtented] Use me
    // ...
}
```

### Define property

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

## ConnectableObject

Handling the connection and disconnection

```
function ConnectableObjecExtented() {

}
ConnectableObject._applyPrototypeTo(ConnectableObjecExtented);

ConnectableObjecExtented.prototype._handleConnection(options) {
    return new Promise((resolve, reject) => {
        // Do your connection
        resolve();
    });
}

ConnectableObjecExtented.prototype._handleDisconnection(options) {
    return new Promise((resolve, reject) => {
        // Do your disconnection
        resolve();
    });
}
```

Using finalization will always call **disconnect** when the state is **Ready**. To change the behaviour 
override the function **_handleFinalization**.



# Installation

Production
```
npm install --production js-zrim-core
```

Build or Development
```
npm install js-zrim-core
```


# Tests

To run the test you need to install in development mode.

```
npm test
```

# License

Zrim-Everything - yogo95 - CeCILL v2
