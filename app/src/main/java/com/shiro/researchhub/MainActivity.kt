package com.shiro.researchhub

import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.widget.addTextChangedListener
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.tabs.TabLayout
import com.shiro.researchhub.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var adapter: ResearchAdapter

    private val allItems = DemoRepository.items()
    private var currentType: ResearchType? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupTopBar()
        setupFilters()
        setupRecycler()
        render()
    }

    private fun setupTopBar() {
        binding.addButton.setOnClickListener {
            Toast.makeText(this, "Quick Add is ready for backend integration.", Toast.LENGTH_SHORT).show()
        }

        binding.syncButton.setOnClickListener {
            Toast.makeText(this, "Sync complete", Toast.LENGTH_SHORT).show()
        }

        binding.searchInput.addTextChangedListener {
            render()
        }
    }

    private fun setupFilters() {
        val priorities = listOf("Any Priority", "P1", "P2", "P3")
        binding.priorityFilter.setAdapter(ArrayAdapter(this, android.R.layout.simple_list_item_1, priorities))
        binding.priorityFilter.setText(priorities.first(), false)
        binding.priorityFilter.setOnItemClickListener { _, _, _, _ -> render() }

        binding.typeTabs.addOnTabSelectedListener(object : TabLayout.OnTabSelectedListener {
            override fun onTabSelected(tab: TabLayout.Tab) {
                currentType = when (tab.position) {
                    1 -> ResearchType.PAPER
                    2 -> ResearchType.PROJECT
                    3 -> ResearchType.IDEA
                    4 -> ResearchType.TODO
                    else -> null
                }
                render()
            }
            override fun onTabUnselected(tab: TabLayout.Tab) = Unit
            override fun onTabReselected(tab: TabLayout.Tab) = Unit
        })
    }

    private fun setupRecycler() {
        adapter = ResearchAdapter { item -> showItemDialog(item) }
        binding.recyclerView.layoutManager = LinearLayoutManager(this)
        binding.recyclerView.adapter = adapter
    }

    private fun showItemDialog(item: ResearchItem) {
        val message = "Topic: ${item.topic}\nType: ${item.type}\nPriority: P${item.priority}\nProgress: ${item.progress}%\nDue: ${item.dueInDays} days\n\n${item.notes}"
        MaterialAlertDialogBuilder(this)
            .setTitle(item.title)
            .setMessage(message)
            .setPositiveButton("Mark +10%") { _, _ ->
                Toast.makeText(this, "Progress update can be connected to persistent storage.", Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton("Close", null)
            .show()
    }

    private fun render() {
        val query = binding.searchInput.text?.toString()?.trim()?.lowercase().orEmpty()
        val selectedPriority = when (binding.priorityFilter.text?.toString()) {
            "P1" -> 1
            "P2" -> 2
            "P3" -> 3
            else -> null
        }

        val filtered = allItems.filter { item ->
            val matchesQuery = query.isBlank() ||
                item.title.lowercase().contains(query) ||
                item.topic.lowercase().contains(query) ||
                item.notes.lowercase().contains(query)
            val matchesType = currentType == null || item.type == currentType
            val matchesPriority = selectedPriority == null || item.priority == selectedPriority
            matchesQuery && matchesType && matchesPriority
        }

        adapter.submitList(filtered)
        binding.statsCount.text = "${filtered.size} active"
        binding.statsProgress.text = "Avg ${averageProgress(filtered)}%"
    }

    private fun averageProgress(items: List<ResearchItem>): Int {
        if (items.isEmpty()) return 0
        return items.sumOf { it.progress } / items.size
    }
}
