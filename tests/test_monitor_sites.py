import datetime as dt
import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/"scripts"))
from monitor_sites import verify_registry,UTC

NOW=dt.datetime(2026,11,16,12,tzinfo=UTC)
def snapshot(counts=("companies","aquaculture"), status="fresh",date=None):
    return {"status":status,"generated_at":(date or NOW).isoformat(),
            counts[0]:[{}]*500,counts[1]:[{}]*200,"sources":{"CFIA":"ok"}}
class SnapshotTests(unittest.TestCase):
    def test_good_canada(self):
        errors,warnings=verify_registry("Canada",snapshot(),now=NOW)
        self.assertEqual(errors,[])
        self.assertEqual(warnings,[])
    def test_good_norway(self):
        doc=snapshot(("companies","vessels"),"updated")
        self.assertEqual(verify_registry("Norway",doc,now=NOW)[0],[])
    def test_stale_warns(self):
        doc=snapshot(status="stale")
        self.assertFalse(verify_registry("Canada",doc,now=NOW)[0])
        self.assertTrue(verify_registry("Canada",doc,now=NOW)[1])
    def test_registry_drop_fails(self):
        doc=snapshot();doc["companies"]=[]
        self.assertTrue(verify_registry("Canada",doc,now=NOW)[0])
    def test_outdated_snapshot_fails(self):
        doc=snapshot(date=NOW-dt.timedelta(days=17))
        self.assertTrue(verify_registry("Canada",doc,now=NOW)[0])
if __name__=="__main__":unittest.main()
