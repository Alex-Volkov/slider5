var Preloader = {
    body: document.getElementsByTagName('body'),
    load: function (elements, data, tag, doNotAppend, cb) {
        var self = this;
        if(!self.loadList){
            self.loadList = elements;
            self.loadLength = elements.length;
            self.loadCount = 0;
        }
        //console.log(elements, data, Preloader.loadCount);
        var elemCount = data.length;
       // console.log(elemCount, tag);
        data.forEach(function (elem) {
            self.node = document.createElement(tag);
            self.node.setAttribute('src', elem);
            if (!doNotAppend) {
                self.body[0].appendChild(self.node);
            }
            self.node.addEventListener('load', function (el) {
                elemCount--;
                //console.log(elem);
                if (!elemCount) {
                    self.loadCount++;
                    if (self.loadCount < self.loadLength) {
                        self.load(elements, elements[self.loadCount], tag, false, cb)
                    } else {
                        //console.log(self.loadCount, ' loadCount ', self.loadLength, !!cb);
                        if (self.loadCount == self.loadLength && !!cb) {
                            cb()
                        }
                    }
//                    console.log('loaded ', tag);

                }
            });
        });
    }
};