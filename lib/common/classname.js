/**
 * New node file
 */

(function(root, factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
      define(['namespace-module'], function(NameSpaceModule) {
          return factory(NameSpaceModule);
      });
  } else if (typeof exports === 'object') {
      module.exports = factory(require(__dirname + '/namespace-module'));
  } else if (Qt && typeof Qt === 'object') {
      factory(Qt.NameSpaceModule);
  } else {
      root.ClassName = factory(root.NameSpaceModule);
  }
}(this, function(NameSpaceModule) {
    'use strict';

    var javaScriptHelper = NameSpaceModule().javaScriptHelper;


    /**
     * Nom de classe
     * @param {ClassName} arg0      La classe à copier
     * @param {string} arg0         Le nom de clase
     * @param {type} arg1           Le libellé si le nom de classe est données
     * @returns {ClassName}
     */
    function ClassName(arg0, arg1) {

        var properties = {
            null_: true,
            className: undefined,
            label: undefined
        };


        if (arg0 instanceof ClassName) {
            properties.null_ = arg0.property.is_null;
            properties.className = properties.className;
            properties.label = properties.label;
        } else if (javaScriptHelper.isString(arg0)) {
            properties.null_ = false;
            properties.className = arg0;
            properties.label = javaScriptHelper.isString(arg1) ? arg1 : undefined;
        } else if (javaScriptHelper.isObject(arg0)) {
            if (javaScriptHelper.isString(arg0.className)) {
                properties.null_ = false;
                properties.className = arg0.className;
                properties.label = javaScriptHelper.isString(arg0.label) ? arg0.label : undefined;
                if (javaScriptHelper.isBoolean(arg0.null_)) {
                    properties.null_ = arg0.null_;
                } else if (javaScriptHelper.isBoolean(arg0["null"])) {
                    properties.null_ = arg0["null"];
                }
            } else {
                throw new TypeError("Invalid class name property");
            }
        }


        // Add properties
        Object.defineProperty(this, 'is_null', {
            enumerable: false,
            get: function() {
                return properties.null_;
            },
            set: function() { }
        });

        Object.defineProperty(this, 'className', {
            enumerable: true,
            get: function() {
                return properties.className ? properties.className : "";
            },
            set: function(className) {
                if (javaScriptHelper.isString(className)) {
                    properties.className = className;
                    properties.null_ = false;
                }
            }
        });

        Object.defineProperty(this, 'label', {
            enumerable: true,
            get: function() {
                return properties.label ? properties.label : "";
            },
            set: function(label) {
                if (javaScriptHelper.isString(label)) {
                    properties.className = label;
                    properties.null_ = false;
                }
            }
        });
    }

    // Retourne la chaine
    ClassName.prototype.toString = function() {
        return this.is_null ? "" : (javaScriptHelper.isEmptyString(this.label) ? this.className : this.label);
    };

    ClassName.prototype.equals = function(arg0) {
        if (!arg0) {
            return false;
        } else if (arg0 === null) {
            return this.is_null;
        } else if (arg0 instanceof ClassName) {
            return this.is_null === arg0.is_null &&
                this.className === arg0.className &&
                this.label === arg0.label;
        } else if (javaScriptHelper.isString(arg0)) {
            return this.className === arg0 || this.label === arg0;
        }

        return false;
    };

    // Si l'objet hérite d'une autre classe
    ClassName.prototype.inherits = function(className) {
        var classNameStr_2 = "";
        var classNameStr_1 = this.className;

        if (!className || javaScriptHelper.isNull(className) || !classNameStr_1 || javaScriptHelper.isNull(classNameStr_1)) {
            return false;
        } else if (javaScriptHelper.isString(className)) {
            classNameStr_2 = className;
        } else if (className instanceof ClassName) {
            classNameStr_2 = className.className;
        } else {
            return false;
        }

        var s1 = classNameStr_1.length, s2 = classNameStr_2.length;

        if (s1 < s2 || s1 === 0 || s2 === 0) {
            return false;   // Pour qu'il hérite il faut que S1 >= S2
        } else if (classNameStr_1[s1 - 1] === '.' || classNameStr_2[s2 - 1] === '.') {
            return false;   // N'accepte pas un élément finissant par un .
        } else if (classNameStr_1.startsWith(classNameStr_2)) {
            // Il doit être égale ou avec .xx après
            if (s1 === s2) {
                return true;    // Même taille donc pareil
            } else if (s2 + 2 > s1 ) {  // Si on ajoute un . + <char> il faut être == ou < s1
                return false;
            }

            return classNameStr_1[s2] === '.';  // Il faut que le caractère après la fin de la classe soit un .
        } else {
            return false;
        }
    };

    ClassName.prototype.clone = function() {
        return new ClassName(this);
    };

    ClassName.prototype.toJSON = function() { return this.toString(); }

    // Définition dans l'espace de nom
    if (NameSpaceModule().hasClass("fr.ista.tsp.core.ClassName")) {
      NameSpaceModule().defineClass("fr.ista.tsp.core.ClassName", ClassName);
    }

    return ClassName;
}));
