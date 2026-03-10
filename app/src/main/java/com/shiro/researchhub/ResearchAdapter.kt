package com.shiro.researchhub

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.shiro.researchhub.databinding.ItemResearchBinding
import kotlin.math.max
import kotlin.math.min

class ResearchAdapter(
    private val onClick: (ResearchItem) -> Unit
) : RecyclerView.Adapter<ResearchAdapter.ResearchViewHolder>() {

    private val items = mutableListOf<ResearchItem>()

    fun submitList(newItems: List<ResearchItem>) {
        items.clear()
        items.addAll(newItems)
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ResearchViewHolder {
        val binding = ItemResearchBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ResearchViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ResearchViewHolder, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    inner class ResearchViewHolder(private val binding: ItemResearchBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(item: ResearchItem) {
            binding.titleText.text = item.title
            binding.metaText.text = "${item.topic} - ${item.type.name}"
            binding.notesPreview.text = item.notes
            binding.progressBar.progress = item.progress
            binding.progressText.text = "${item.progress}%"
            binding.dueText.text = "Due in ${item.dueInDays}d"
            binding.priorityText.text = "P${item.priority}"

            val priorityColor = when (item.priority) {
                3 -> R.color.priority_high
                2 -> R.color.priority_medium
                else -> R.color.priority_low
            }
            binding.priorityText.setBackgroundColor(ContextCompat.getColor(binding.root.context, priorityColor))

            val clamped = min(100, max(0, item.progress))
            binding.progressBar.progress = clamped

            binding.root.setOnClickListener { onClick(item) }
        }
    }
}
