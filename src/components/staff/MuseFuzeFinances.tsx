Here's the fixed version with the missing closing brackets and parentheses:

```javascript
// Previous code remains the same...

              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MuseFuzeFinances;
```

The file was missing closing brackets for several nested elements and the component itself. I've added the necessary closing brackets to complete the structure.