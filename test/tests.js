const expect = chai.expect; // or the other dialects

describe("utils.js", () => {

  describe('redactNames', () => {
    it("it should redact the word following a tilde", () => {
      expect(redactNames("~George ran into ~Sue with ~Tom")).to.equal("#name# ran into #name# with #name#");
    });
  });

  describe('addHtmlBr()', () => {
    it('replace \\n with <br>', () => {
      expect(addHtmlBr("\nTest\n\nthis\nstring\n")).to.equal("<br>Test<br><br>this<br>string<br>");
    });
  });

  describe('makeRow()', () => {
    it('create a row element', () => {
      expect(makeRow("one","two","three").innerHTML).to.equal("<th>one</th><td>two</td><td>three</td>");
    });
  });

  describe('makeRowHeading()', () => {
    it('create a row heading element', () => {
      console.log(makeRowHeading("one", "two").innerHTML);
      expect(makeRowHeading("one", "two").innerHTML).to.equal("<th>one</th><th>two</th>");
    });
  });

  describe('dateReviver()', () => {
    it('create a Date type object from JSON.parse(s,dateReviver)', () => {
      let o = { }
      o.dt = new Date();
      let s = JSON.stringify(o);
      o = JSON.parse(s,dateReviver);
      expect(o.dt).to.be.a("Date");
    });
  });

});
